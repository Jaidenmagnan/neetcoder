import {
	type Client,
	EmbedBuilder,
	type Guild,
	type GuildTextBasedChannel,
	PermissionFlagsBits,
} from 'discord.js';
import { RecapError } from '../../services/recapErrors';
import type {
	RecapMessage,
	RecapPreview,
	ResolvedRecapConfiguration,
} from '../../types/recap';

export interface FetchRecapMessagesResult {
	messages: RecapMessage[];
	truncated: boolean;
}

export interface ValidateRecapConfigurationInput {
	discordGuildId: string;
	discordSourceChannelId: string;
	discordDestinationChannelId: string;
}

export interface RecapDiscordGateway {
	validateConfiguration(input: ValidateRecapConfigurationInput): Promise<void>;
	fetchMessages(
		configuration: ResolvedRecapConfiguration,
		windowStart: Date,
		windowEnd: Date,
		limit: number,
	): Promise<FetchRecapMessagesResult>;
	postRecap(
		configuration: ResolvedRecapConfiguration,
		preview: RecapPreview,
	): Promise<void>;
}

/** Reads recap source messages and publishes the formatted Discord embed. */
export class DiscordRecapAdapter implements RecapDiscordGateway {
	constructor(private readonly client: Client) {}

	async validateConfiguration(
		input: ValidateRecapConfigurationInput,
	): Promise<void> {
		const guild = await this.fetchGuild(input.discordGuildId);
		const source = await this.fetchTextChannel(
			guild,
			input.discordSourceChannelId,
		);
		const destination = await this.fetchTextChannel(
			guild,
			input.discordDestinationChannelId,
		);
		const botMember = guild.members.me;
		if (!botMember) {
			throw new RecapError(
				'discord-error',
				'The bot is not ready in this server.',
			);
		}

		const sourcePermissions = source.permissionsFor(botMember);
		if (
			!sourcePermissions?.has([
				PermissionFlagsBits.ViewChannel,
				PermissionFlagsBits.ReadMessageHistory,
			])
		) {
			throw new RecapError(
				'discord-error',
				'The bot needs View Channel and Read Message History in the source channel.',
			);
		}

		const destinationPermissions = destination.permissionsFor(botMember);
		if (
			!destinationPermissions?.has([
				PermissionFlagsBits.ViewChannel,
				PermissionFlagsBits.SendMessages,
				PermissionFlagsBits.EmbedLinks,
			])
		) {
			throw new RecapError(
				'discord-error',
				'The bot needs View Channel, Send Messages, and Embed Links in the recap channel.',
			);
		}
	}

	async fetchMessages(
		configuration: ResolvedRecapConfiguration,
		windowStart: Date,
		windowEnd: Date,
		limit: number,
	): Promise<FetchRecapMessagesResult> {
		const guild = await this.fetchGuild(configuration.discordGuildId);
		const channel = await this.fetchTextChannel(
			guild,
			configuration.discordSourceChannelId,
		);
		const messages: RecapMessage[] = [];
		const participants = new Map<string, string>();
		let before: string | undefined;
		let reachedWindowStart = false;

		while (messages.length < limit && !reachedWindowStart) {
			const page = await channel.messages.fetch({ limit: 100, before });
			if (page.size === 0) break;

			const ordered = [...page.values()].sort(
				(a, b) => b.createdTimestamp - a.createdTimestamp,
			);
			for (const message of ordered) {
				before = message.id;
				if (message.createdAt <= windowStart) {
					reachedWindowStart = true;
					break;
				}
				if (message.createdAt > windowEnd) continue;

				const content = [
					message.content,
					...message.attachments.map((attachment) => attachment.url),
				]
					.filter(Boolean)
					.join('\n')
					.trim();
				if (!content) continue;

				let participant = participants.get(message.author.id);
				if (!participant) {
					participant = `Participant ${participants.size + 1}`;
					participants.set(message.author.id, participant);
				}
				messages.push({
					author: participant,
					content: content.slice(0, 1_000),
					createdAt: message.createdAt,
				});
				if (messages.length === limit) break;
			}

			if (page.size < 100) break;
		}

		const truncated = messages.length === limit && !reachedWindowStart;
		messages.reverse();
		return { messages, truncated };
	}

	async postRecap(
		configuration: ResolvedRecapConfiguration,
		preview: RecapPreview,
	): Promise<void> {
		const guild = await this.fetchGuild(configuration.discordGuildId);
		const channel = await this.fetchTextChannel(
			guild,
			configuration.discordDestinationChannelId,
		);
		if (!channel.isSendable()) {
			throw new RecapError(
				'discord-error',
				'The configured recap channel cannot receive messages.',
			);
		}
		await channel.send({
			embeds: [buildRecapEmbed(configuration, preview)],
		});
	}

	private async fetchGuild(discordGuildId: string): Promise<Guild> {
		try {
			return await this.client.guilds.fetch(discordGuildId);
		} catch {
			throw new RecapError(
				'discord-error',
				'The configured server was not found.',
			);
		}
	}

	private async fetchTextChannel(
		guild: Guild,
		discordChannelId: string,
	): Promise<GuildTextBasedChannel> {
		const channel = await guild.channels.fetch(discordChannelId);
		if (
			!channel?.isTextBased() ||
			channel.isDMBased() ||
			!('messages' in channel)
		) {
			throw new RecapError(
				'discord-error',
				'Select a supported server text channel.',
			);
		}
		return channel;
	}
}

/** Builds the shared scheduled and preview presentation. */
export function buildRecapEmbed(
	configuration: ResolvedRecapConfiguration,
	preview: RecapPreview,
): EmbedBuilder {
	const embed = new EmbedBuilder()
		.setColor(0x5865f2)
		.setTitle('🗞️ Daily Channel Recap')
		.setDescription(
			`A balanced snapshot of the conversation in <#${configuration.discordSourceChannelId}>.`,
		)
		.addFields(
			section('Top Discussions', preview.content.topDiscussions),
			section('Points of Agreement', preview.content.pointsOfAgreement),
			section('Where Views Differ', preview.content.whereViewsDiffer),
			section('Notable Links', preview.content.notableLinks),
		)
		.setFooter({
			text: `${preview.messageCount.toLocaleString()} messages summarized${preview.truncated ? ' • newest 1,000-message limit reached' : ''}`,
		})
		.setTimestamp(preview.windowEnd);

	return embed;
}

function section(name: string, items: string[]) {
	const value =
		items.length > 0 ? items.map((item) => `• ${item}`).join('\n') : '—';
	return { name, value: truncate(value, 1_024), inline: false };
}

function truncate(value: string, maximum: number): string {
	return value.length <= maximum
		? value
		: `${value.slice(0, maximum - 1).trimEnd()}…`;
}
