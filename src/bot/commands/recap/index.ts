import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
} from 'discord.js';
import {
	ChannelType,
	EmbedBuilder,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';
import { buildRecapEmbed } from '../../../adapters/Discord/discordRecapAdapter';
import { recapService } from '../../../di/container';
import { RecapError } from '../../../services/recapErrors';

const COMMON_TIMEZONES = [
	'America/New_York',
	'America/Chicago',
	'America/Denver',
	'America/Los_Angeles',
	'America/Phoenix',
	'America/Anchorage',
	'Pacific/Honolulu',
	'America/Toronto',
	'America/Vancouver',
	'UTC',
	'Europe/London',
	'Europe/Paris',
	'Asia/Tokyo',
	'Australia/Sydney',
] as const;

export const data = new SlashCommandBuilder()
	.setName('recap')
	.setDescription('Configure a polished daily channel recap')
	.setContexts(InteractionContextType.Guild)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	.addSubcommand((command) =>
		command
			.setName('setup')
			.setDescription('Create or replace this server’s daily recap')
			.addChannelOption((option) =>
				option
					.setName('source')
					.setDescription('Channel whose discussion should be summarized')
					.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
					.setRequired(true),
			)
			.addChannelOption((option) =>
				option
					.setName('destination')
					.setDescription('Channel where the daily recap should be posted')
					.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('time')
					.setDescription('Daily posting time in 24-hour HH:MM format')
					.setMinLength(5)
					.setMaxLength(5)
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('timezone')
					.setDescription('IANA timezone, such as America/New_York')
					.setAutocomplete(true)
					.setRequired(true),
			),
	)
	.addSubcommand((command) =>
		command
			.setName('preview')
			.setDescription('Privately preview the recap that would be posted now'),
	)
	.addSubcommand((command) =>
		command
			.setName('status')
			.setDescription('Show this server’s current recap schedule'),
	)
	.addSubcommand((command) =>
		command
			.setName('disable')
			.setDescription('Disable this server’s daily recap'),
	);

export async function execute(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	if (!interaction.guildId) {
		await interaction.reply({
			content: 'Daily recaps can only be configured in a server.',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
		await interaction.reply({
			content: 'You need the Manage Server permission to configure recaps.',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	await interaction.deferReply({ flags: MessageFlags.Ephemeral });
	try {
		const subcommand = interaction.options.getSubcommand(true);
		if (subcommand === 'setup') {
			await setup(interaction);
		} else if (subcommand === 'preview') {
			await preview(interaction);
		} else if (subcommand === 'status') {
			await status(interaction);
		} else if (subcommand === 'disable') {
			await disable(interaction);
		}
	} catch (error) {
		if (!(error instanceof RecapError)) {
			console.error('Recap command failed.', error);
		}
		await interaction.editReply({
			content:
				error instanceof RecapError
					? error.message
					: 'The recap operation failed. Check the bot logs for details.',
		});
	}
}

export async function autocomplete(
	interaction: AutocompleteInteraction,
): Promise<void> {
	const query = interaction.options.getFocused().toLowerCase();
	await interaction.respond(
		COMMON_TIMEZONES.filter((timezone) =>
			timezone.toLowerCase().includes(query),
		)
			.slice(0, 25)
			.map((timezone) => ({ name: timezone, value: timezone })),
	);
}

async function setup(interaction: ChatInputCommandInteraction): Promise<void> {
	const source = interaction.options.getChannel('source', true);
	const destination = interaction.options.getChannel('destination', true);
	const configuration = await recapService.configure({
		discordGuildId: interaction.guildId as string,
		discordSourceChannelId: source.id,
		discordDestinationChannelId: destination.id,
		time: interaction.options.getString('time', true),
		timezone: interaction.options.getString('timezone', true),
	});

	await interaction.editReply({
		embeds: [configurationEmbed(configuration, 'Daily recap configured')],
	});
}

async function preview(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	const discordGuildId = interaction.guildId as string;
	const [configuration, recap] = await Promise.all([
		recapService.getConfiguration(discordGuildId),
		recapService.preview(discordGuildId),
	]);
	if (!configuration) {
		throw new RecapError(
			'not-configured',
			'This server does not have a daily recap configured.',
		);
	}
	await interaction.editReply({
		content: 'Private preview — the recap cursor has not been advanced.',
		embeds: [buildRecapEmbed(configuration, recap)],
	});
}

async function status(interaction: ChatInputCommandInteraction): Promise<void> {
	const configuration = await recapService.getConfiguration(
		interaction.guildId as string,
	);
	if (!configuration) {
		throw new RecapError(
			'not-configured',
			'This server does not have a daily recap configured.',
		);
	}
	await interaction.editReply({ embeds: [configurationEmbed(configuration)] });
}

async function disable(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	const disabled = await recapService.disable(interaction.guildId as string);
	await interaction.editReply({
		content: disabled
			? 'Daily recap disabled. Existing recap posts were left untouched.'
			: 'This server does not have a daily recap configured.',
	});
}

function configurationEmbed(
	configuration: Awaited<ReturnType<typeof recapService.configure>>,
	title = 'Daily recap status',
): EmbedBuilder {
	return new EmbedBuilder()
		.setColor(0x57f287)
		.setTitle(title)
		.addFields(
			{
				name: 'Conversation channel',
				value: `<#${configuration.discordSourceChannelId}>`,
				inline: true,
			},
			{
				name: 'Recap channel',
				value: `<#${configuration.discordDestinationChannelId}>`,
				inline: true,
			},
			{
				name: 'Schedule',
				value: `Every day at **${configuration.time}**\n${configuration.timezone}`,
				inline: false,
			},
			{
				name: 'Coverage',
				value: 'Since the previous successful recap • newest 1,000 messages',
				inline: false,
			},
		)
		.setFooter({ text: 'Times follow daylight-saving changes automatically.' });
}
