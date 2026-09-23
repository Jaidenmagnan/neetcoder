import type {
	Client,
	Guild,
	GuildMember,
	GuildTextBasedChannel,
	Message,
	Role,
} from 'discord.js';
import {
	ContainerBuilder,
	MessageFlags,
	PermissionFlagsBits,
	TextDisplayBuilder,
} from 'discord.js';
import { normalizeEmojiInput } from '../../services/reactionRoleEmoji';
import { ReactionRoleError } from '../../services/reactionRoleErrors';
import type {
	NormalizedEmoji,
	ReactionRoleMode,
	ReactionRolePanelWithOptions,
} from '../../types/reactionRole';

const DANGEROUS_ROLE_PERMISSIONS = [
	PermissionFlagsBits.Administrator,
	PermissionFlagsBits.BanMembers,
	PermissionFlagsBits.KickMembers,
	PermissionFlagsBits.ManageChannels,
	PermissionFlagsBits.ManageEvents,
	PermissionFlagsBits.ManageGuild,
	PermissionFlagsBits.ManageGuildExpressions,
	PermissionFlagsBits.ManageMessages,
	PermissionFlagsBits.ManageNicknames,
	PermissionFlagsBits.ManageRoles,
	PermissionFlagsBits.ManageThreads,
	PermissionFlagsBits.ManageWebhooks,
	PermissionFlagsBits.MentionEveryone,
	PermissionFlagsBits.ModerateMembers,
];

export interface ValidateReactionRoleConfigurationInput {
	discordGuildId: string;
	discordChannelId: string;
	actorId: string;
	discordRoleId: string;
	emoji: string;
	mode: ReactionRoleMode;
	existingMessageId?: string;
}

export interface CreateReactionRoleMessageInput {
	discordGuildId: string;
	discordChannelId: string;
	name: string;
	title?: string;
	description?: string;
	mode: ReactionRoleMode;
	discordRoleId: string;
	emoji: NormalizedEmoji;
}

/** Discord operations required by the reaction-role domain service. */
export interface ReactionRoleDiscordGateway {
	validateConfiguration(
		input: ValidateReactionRoleConfigurationInput,
	): Promise<NormalizedEmoji>;
	createPanelMessage(input: CreateReactionRoleMessageInput): Promise<string>;
	deleteMessage(
		discordGuildId: string,
		discordChannelId: string,
		discordMessageId: string,
	): Promise<void>;
	addBotReaction(
		config: ReactionRolePanelWithOptions,
		emojiDisplay: string,
	): Promise<void>;
	removeBotReaction(
		config: ReactionRolePanelWithOptions,
		emojiKey: string,
	): Promise<void>;
	synchronizePanel(config: ReactionRolePanelWithOptions): Promise<string[]>;
	validateAssignableRole(
		discordGuildId: string,
		discordRoleId: string,
	): Promise<void>;
	addMemberRole(
		discordGuildId: string,
		memberId: string,
		roleId: string,
	): Promise<void>;
	removeMemberRole(
		discordGuildId: string,
		memberId: string,
		roleId: string,
	): Promise<void>;
	removeMemberReaction(
		config: ReactionRolePanelWithOptions,
		emojiKey: string,
		memberId: string,
	): Promise<void>;
}

/** Implements safe role and reaction mutations through discord.js. */
export class DiscordReactionRoleAdapter implements ReactionRoleDiscordGateway {
	constructor(private readonly client: Client) {}

	/** Validates all Discord resources before a configuration is persisted. */
	async validateConfiguration(
		input: ValidateReactionRoleConfigurationInput,
	): Promise<NormalizedEmoji> {
		const guild = await this.client.guilds.fetch(input.discordGuildId);
		const channel = await this.fetchTextChannel(guild, input.discordChannelId);
		const actor = await guild.members.fetch(input.actorId);
		const botMember = await guild.members.fetchMe();
		const role = await guild.roles.fetch(input.discordRoleId);

		if (!role) {
			throw new ReactionRoleError(
				'not-found',
				'The selected role no longer exists.',
			);
		}

		this.assertChannelPermissions(
			channel,
			botMember,
			input.mode,
			!input.existingMessageId,
		);
		this.assertSafeRole(guild, actor, botMember, role);

		if (input.existingMessageId) {
			await this.fetchMessage(channel, input.existingMessageId);
		}

		return normalizeEmojiInput(input.emoji);
	}

	/** Publishes a bot-managed Components V2 reaction-role panel. */
	async createPanelMessage(
		input: CreateReactionRoleMessageInput,
	): Promise<string> {
		const guild = await this.client.guilds.fetch(input.discordGuildId);
		const channel = await this.fetchTextChannel(guild, input.discordChannelId);
		const message = await channel.send({
			allowedMentions: { parse: [] },
			components: this.buildPanelComponents({
				name: input.name,
				title: input.title ?? null,
				description: input.description ?? null,
				mode: input.mode,
				options: [
					{
						discordRoleId: input.discordRoleId,
						emojiDisplay: input.emoji.display,
					},
				],
			}),
			flags: MessageFlags.IsComponentsV2,
		});

		return message.id;
	}

	/** Deletes a newly created managed message during failed setup compensation. */
	async deleteMessage(
		discordGuildId: string,
		discordChannelId: string,
		discordMessageId: string,
	): Promise<void> {
		const guild = await this.client.guilds.fetch(discordGuildId);
		const channel = await this.fetchTextChannel(guild, discordChannelId);
		const message = await this.fetchMessage(channel, discordMessageId);
		await message.delete();
	}

	/** Adds the bot's seed reaction so members can select the mapping. */
	async addBotReaction(
		config: ReactionRolePanelWithOptions,
		emojiDisplay: string,
	): Promise<void> {
		const message = await this.resolveMessage(config);
		await message.react(emojiDisplay);
	}

	/** Removes only the bot's seed reaction during failed setup compensation. */
	async removeBotReaction(
		config: ReactionRolePanelWithOptions,
		emojiKey: string,
	): Promise<void> {
		const message = await this.resolveMessage(config);
		const reaction = message.reactions.cache.find(
			(candidate) =>
				this.reactionKey(candidate.emoji.id, candidate.emoji.name) === emojiKey,
		);

		if (reaction && this.client.user) {
			await reaction.users.remove(this.client.user.id);
		}
	}

	/** Repairs rendering and seed reactions while reporting stale role mappings. */
	async synchronizePanel(
		config: ReactionRolePanelWithOptions,
	): Promise<string[]> {
		const guild = await this.client.guilds.fetch(config.panel.discordGuildId);
		const channel = await this.fetchTextChannel(
			guild,
			config.panel.discordChannelId,
		);
		const botMember = await guild.members.fetchMe();
		this.assertChannelPermissions(
			channel,
			botMember,
			config.panel.mode,
			config.panel.isManagedMessage,
		);

		const message = await this.fetchMessage(
			channel,
			config.panel.discordMessageId,
		);
		const warnings: string[] = [];

		for (const option of config.options) {
			const role = await guild.roles.fetch(option.discordRoleId);
			if (!role) {
				warnings.push(`Role ${option.discordRoleId} no longer exists.`);
			} else if (!role.editable || this.hasDangerousPermissions(role)) {
				warnings.push(
					`Role ${role.name} is no longer safe for self-assignment.`,
				);
			}
		}

		if (config.panel.isManagedMessage) {
			await message.edit({
				allowedMentions: { parse: [] },
				components: this.buildPanelComponents({
					name: config.panel.name,
					title: config.panel.title,
					description: config.panel.description,
					mode: config.panel.mode,
					options: config.options,
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		for (const option of config.options) {
			try {
				await message.react(option.emojiDisplay);
			} catch (error) {
				warnings.push(
					`Could not add reaction ${option.emojiDisplay}: ${this.errorMessage(error)}`,
				);
			}
		}

		return warnings;
	}

	/** Adds a configured role to a guild member. */
	async addMemberRole(
		discordGuildId: string,
		memberId: string,
		roleId: string,
	): Promise<void> {
		await this.validateAssignableRole(discordGuildId, roleId);
		const guild = await this.client.guilds.fetch(discordGuildId);
		const member = await guild.members.fetch(memberId);
		await member.roles.add(roleId, 'Reaction role selected');
	}

	/** Fails closed if a configured role becomes privileged or unmanageable. */
	async validateAssignableRole(
		discordGuildId: string,
		discordRoleId: string,
	): Promise<void> {
		const guild = await this.client.guilds.fetch(discordGuildId);
		const botMember = await guild.members.fetchMe();
		const role = await guild.roles.fetch(discordRoleId);

		if (
			!role ||
			role.id === guild.id ||
			role.managed ||
			!role.editable ||
			botMember.roles.highest.comparePositionTo(role) <= 0 ||
			this.hasDangerousPermissions(role)
		) {
			throw new ReactionRoleError(
				'unsafe-role',
				'The configured role is no longer safe for self-assignment.',
			);
		}
	}

	/** Removes a configured role from a guild member. */
	async removeMemberRole(
		discordGuildId: string,
		memberId: string,
		roleId: string,
	): Promise<void> {
		const guild = await this.client.guilds.fetch(discordGuildId);
		const member = await guild.members.fetch(memberId);
		await member.roles.remove(roleId, 'Reaction role deselected');
	}

	/** Removes one member's superseded reaction from an exclusive panel. */
	async removeMemberReaction(
		config: ReactionRolePanelWithOptions,
		emojiKey: string,
		memberId: string,
	): Promise<void> {
		const message = await this.resolveMessage(config);
		const reaction = message.reactions.cache.find(
			(candidate) =>
				this.reactionKey(candidate.emoji.id, candidate.emoji.name) === emojiKey,
		);

		if (reaction) {
			await reaction.users.remove(memberId);
		}
	}

	private async fetchTextChannel(
		guild: Guild,
		channelId: string,
	): Promise<GuildTextBasedChannel> {
		const channel = await guild.channels.fetch(channelId);

		if (!channel?.isTextBased() || !channel.isSendable()) {
			throw new ReactionRoleError(
				'validation',
				'Select a supported guild text channel.',
			);
		}

		return channel;
	}

	private async fetchMessage(
		channel: GuildTextBasedChannel,
		messageId: string,
	): Promise<Message<true>> {
		try {
			return await channel.messages.fetch(messageId);
		} catch (error) {
			throw new ReactionRoleError(
				'not-found',
				'The message was not found in the selected channel.',
				{ cause: error },
			);
		}
	}

	private async resolveMessage(
		config: ReactionRolePanelWithOptions,
	): Promise<Message<true>> {
		const guild = await this.client.guilds.fetch(config.panel.discordGuildId);
		const channel = await this.fetchTextChannel(
			guild,
			config.panel.discordChannelId,
		);
		return this.fetchMessage(channel, config.panel.discordMessageId);
	}

	private assertChannelPermissions(
		channel: GuildTextBasedChannel,
		botMember: GuildMember,
		mode: ReactionRoleMode,
		requiresSendMessages: boolean,
	): void {
		const permissions = channel.permissionsFor(botMember);
		const required = [
			PermissionFlagsBits.ViewChannel,
			PermissionFlagsBits.ReadMessageHistory,
			PermissionFlagsBits.AddReactions,
		];

		if (requiresSendMessages) required.push(PermissionFlagsBits.SendMessages);
		if (mode === 'exclusive') required.push(PermissionFlagsBits.ManageMessages);

		if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
			throw new ReactionRoleError(
				'missing-permission',
				'The bot needs the Manage Roles permission.',
			);
		}

		if (!permissions?.has(required)) {
			throw new ReactionRoleError(
				'missing-permission',
				'The bot is missing required permissions in that channel.',
			);
		}
	}

	private assertSafeRole(
		guild: Guild,
		actor: GuildMember,
		botMember: GuildMember,
		role: Role,
	): void {
		if (!actor.permissions.has(PermissionFlagsBits.ManageRoles)) {
			throw new ReactionRoleError(
				'missing-permission',
				'You need the Manage Roles permission to configure reaction roles.',
			);
		}

		const actorCanManage =
			guild.ownerId === actor.id ||
			actor.roles.highest.comparePositionTo(role) > 0;

		if (
			role.id === guild.id ||
			role.managed ||
			!role.editable ||
			botMember.roles.highest.comparePositionTo(role) <= 0 ||
			!actorCanManage ||
			this.hasDangerousPermissions(role)
		) {
			throw new ReactionRoleError(
				'unsafe-role',
				'That role is managed, privileged, or outside the allowed role hierarchy.',
			);
		}
	}

	private hasDangerousPermissions(role: Role): boolean {
		return role.permissions.any(DANGEROUS_ROLE_PERMISSIONS);
	}

	private buildPanelComponents(input: {
		name: string;
		title: string | null;
		description: string | null;
		mode: ReactionRoleMode;
		options: Array<{ discordRoleId: string; emojiDisplay: string }>;
	}): ContainerBuilder[] {
		const title = input.title ?? input.name;
		const selection =
			input.mode === 'exclusive'
				? 'Choose one role from this panel.'
				: 'Choose any roles that apply.';
		const options = input.options
			.map((option) => `${option.emojiDisplay}  <@&${option.discordRoleId}>`)
			.join('\n');
		const content = [
			`## ${title}`,
			input.description,
			selection,
			options || '_No roles are configured._',
		]
			.filter(Boolean)
			.join('\n\n');

		return [
			new ContainerBuilder()
				.setAccentColor(8902285)
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(content)),
		];
	}

	private reactionKey(
		id: string | null,
		name: string | null,
	): string | undefined {
		return id ? `custom:${id}` : name ? `unicode:${name}` : undefined;
	}

	private errorMessage(error: unknown): string {
		return error instanceof Error ? error.message : 'unknown Discord error';
	}
}
