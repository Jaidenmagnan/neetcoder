import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
} from 'discord.js';
import {
	ChannelType,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
	type SlashCommandStringOption,
} from 'discord.js';
import { reactionRoleService } from '../../../di/container';
import { ReactionRoleError } from '../../../services/reactionRoleErrors';
import type {
	ReactionRoleMode,
	ReactionRolePanelWithOptions,
} from '../../../types/reactionRole';

const MODE_CHOICES = [
	{ name: 'Normal — members may select multiple roles', value: 'normal' },
	{ name: 'Exclusive — members may select one role', value: 'exclusive' },
] as const;

export const data = new SlashCommandBuilder()
	.setName('reaction-role')
	.setDescription('Configure persistent reaction-role panels')
	.setContexts(InteractionContextType.Guild)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
	.addSubcommandGroup((group) =>
		group
			.setName('panel')
			.setDescription('Create and manage reaction-role panels')
			.addSubcommand((command) =>
				command
					.setName('create')
					.setDescription('Publish a new reaction-role panel')
					.addStringOption((option) =>
						option
							.setName('name')
							.setDescription('Unique lowercase panel name')
							.setMinLength(1)
							.setMaxLength(32)
							.setRequired(true),
					)
					.addChannelOption((option) =>
						option
							.setName('channel')
							.setDescription('Channel where the panel will be published')
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
							)
							.setRequired(true),
					)
					.addStringOption((option) =>
						option
							.setName('mode')
							.setDescription('How members may select roles')
							.addChoices(...MODE_CHOICES)
							.setRequired(true),
					)
					.addStringOption((option) =>
						option
							.setName('emoji')
							.setDescription('Unicode or custom emoji for the initial role')
							.setRequired(true),
					)
					.addRoleOption((option) =>
						option
							.setName('role')
							.setDescription('Initial self-assignable role')
							.setRequired(true),
					)
					.addStringOption((option) =>
						option
							.setName('title')
							.setDescription('Panel heading; defaults to the panel name')
							.setMaxLength(100),
					)
					.addStringOption((option) =>
						option
							.setName('description')
							.setDescription('Optional instructions shown above the roles')
							.setMaxLength(1000),
					),
			)
			.addSubcommand((command) =>
				command
					.setName('attach')
					.setDescription('Attach reaction roles to an existing message')
					.addStringOption((option) =>
						option
							.setName('name')
							.setDescription('Unique lowercase panel name')
							.setMinLength(1)
							.setMaxLength(32)
							.setRequired(true),
					)
					.addChannelOption((option) =>
						option
							.setName('channel')
							.setDescription('Channel containing the message')
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
							)
							.setRequired(true),
					)
					.addStringOption((option) =>
						option
							.setName('message-id')
							.setDescription('Discord ID of the existing message')
							.setMinLength(17)
							.setMaxLength(20)
							.setRequired(true),
					)
					.addStringOption((option) =>
						option
							.setName('mode')
							.setDescription('How members may select roles')
							.addChoices(...MODE_CHOICES)
							.setRequired(true),
					)
					.addStringOption((option) =>
						option
							.setName('emoji')
							.setDescription('Unicode or custom emoji for the initial role')
							.setRequired(true),
					)
					.addRoleOption((option) =>
						option
							.setName('role')
							.setDescription('Initial self-assignable role')
							.setRequired(true),
					),
			)
			.addSubcommand((command) =>
				command
					.setName('list')
					.setDescription('List reaction-role panels in this server'),
			)
			.addSubcommand((command) =>
				command
					.setName('remove')
					.setDescription('Detach a panel without deleting its message')
					.addStringOption(panelNameOption),
			)
			.addSubcommand((command) =>
				command
					.setName('sync')
					.setDescription('Repair rendering and missing seed reactions')
					.addStringOption(panelNameOption),
			)
			.addSubcommand((command) =>
				command
					.setName('set-mode')
					.setDescription('Change how members may select roles')
					.addStringOption(panelNameOption)
					.addStringOption((option) =>
						option
							.setName('mode')
							.setDescription('New selection mode')
							.addChoices(...MODE_CHOICES)
							.setRequired(true),
					),
			),
	)
	.addSubcommandGroup((group) =>
		group
			.setName('option')
			.setDescription('Manage role mappings on a panel')
			.addSubcommand((command) =>
				command
					.setName('add')
					.setDescription('Add a role and emoji to a panel')
					.addStringOption(panelNameOption)
					.addStringOption((option) =>
						option
							.setName('emoji')
							.setDescription('Unicode or custom emoji for the role')
							.setRequired(true),
					)
					.addRoleOption((option) =>
						option
							.setName('role')
							.setDescription('Self-assignable role')
							.setRequired(true),
					),
			)
			.addSubcommand((command) =>
				command
					.setName('remove')
					.setDescription('Remove a role mapping from a panel')
					.addStringOption(panelNameOption)
					.addRoleOption((option) =>
						option
							.setName('role')
							.setDescription('Configured role to remove')
							.setRequired(true),
					),
			),
	);

/** Executes a guild-scoped reaction-role administration command. */
export async function execute(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	if (!interaction.guildId) {
		await interaction.reply({
			content: 'Reaction roles can only be configured in a server.',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
		await interaction.reply({
			content:
				'You need the Manage Roles permission to configure reaction roles.',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	try {
		const group = interaction.options.getSubcommandGroup(true);
		const subcommand = interaction.options.getSubcommand(true);

		if (group === 'panel') {
			await executePanelCommand(interaction, subcommand);
		} else if (group === 'option') {
			await executeOptionCommand(interaction, subcommand);
		}
	} catch (error) {
		if (!(error instanceof ReactionRoleError)) {
			console.error('Reaction-role command failed.', error);
		}

		await interaction.editReply({
			content:
				error instanceof ReactionRoleError
					? error.message
					: 'The reaction-role operation failed. Check the bot logs for details.',
		});
	}
}

/** Suggests panel names scoped to the guild receiving the interaction. */
export async function autocomplete(
	interaction: AutocompleteInteraction,
): Promise<void> {
	if (!interaction.guildId) {
		await interaction.respond([]);
		return;
	}

	const focused = interaction.options.getFocused().toLowerCase();
	const panels = await reactionRoleService.listPanels(interaction.guildId);
	const choices = panels
		.filter((panel) => panel.name.includes(focused))
		.slice(0, 25)
		.map((panel) => ({ name: panel.name, value: panel.name }));

	await interaction.respond(choices);
}

function panelNameOption(option: SlashCommandStringOption) {
	return option
		.setName('name')
		.setDescription('Reaction-role panel name')
		.setRequired(true)
		.setAutocomplete(true);
}

async function executePanelCommand(
	interaction: ChatInputCommandInteraction,
	subcommand: string,
): Promise<void> {
	const guildId = interaction.guildId as string;

	if (subcommand === 'create' || subcommand === 'attach') {
		const channel = interaction.options.getChannel('channel', true);
		const role = interaction.options.getRole('role', true);
		const common = {
			discordGuildId: guildId,
			discordChannelId: channel.id,
			actorId: interaction.user.id,
			name: interaction.options.getString('name', true),
			mode: getMode(interaction),
			discordRoleId: role.id,
			emoji: interaction.options.getString('emoji', true),
		};

		const result =
			subcommand === 'create'
				? await reactionRoleService.createPanel({
						...common,
						title: interaction.options.getString('title') ?? undefined,
						description:
							interaction.options.getString('description') ?? undefined,
					})
				: await reactionRoleService.attachPanel({
						...common,
						existingMessageId: interaction.options.getString(
							'message-id',
							true,
						),
					});

		await interaction.editReply({
			content: successMessage('Configured', result),
		});
		return;
	}

	if (subcommand === 'list') {
		const panels = await reactionRoleService.listPanels(guildId);
		const visible = panels.slice(0, 25);
		const lines = visible.map(
			(panel) =>
				`• **${panel.name}** — ${panel.mode} — [message](${messageUrl(panel)})`,
		);
		if (panels.length > visible.length) {
			lines.push(`…and ${panels.length - visible.length} more.`);
		}
		await interaction.editReply({
			content:
				lines.length > 0 ? lines.join('\n') : 'No panels are configured.',
		});
		return;
	}

	const name = interaction.options.getString('name', true);
	if (subcommand === 'remove') {
		await reactionRoleService.removePanel(guildId, name);
		await interaction.editReply({
			content: `Detached panel **${name}**. Its Discord message was preserved.`,
		});
	} else if (subcommand === 'sync') {
		const result = await reactionRoleService.synchronizePanel(guildId, name);
		await interaction.editReply({
			content: successMessage('Synchronized', result),
		});
	} else if (subcommand === 'set-mode') {
		const result = await reactionRoleService.setMode(
			guildId,
			name,
			getMode(interaction),
		);
		await interaction.editReply({ content: successMessage('Updated', result) });
	}
}

async function executeOptionCommand(
	interaction: ChatInputCommandInteraction,
	subcommand: string,
): Promise<void> {
	const guildId = interaction.guildId as string;
	const name = interaction.options.getString('name', true);
	const role = interaction.options.getRole('role', true);

	if (subcommand === 'add') {
		const result = await reactionRoleService.addOption({
			discordGuildId: guildId,
			actorId: interaction.user.id,
			panelName: name,
			discordRoleId: role.id,
			emoji: interaction.options.getString('emoji', true),
		});
		await interaction.editReply({
			content: successMessage('Added role to', result),
		});
	} else if (subcommand === 'remove') {
		const result = await reactionRoleService.removeOption(
			guildId,
			name,
			role.id,
		);
		await interaction.editReply({
			content: successMessage('Removed role from', result),
		});
	}
}

function getMode(interaction: ChatInputCommandInteraction): ReactionRoleMode {
	const mode = interaction.options.getString('mode', true);
	if (mode !== 'normal' && mode !== 'exclusive') {
		throw new ReactionRoleError('validation', 'Invalid reaction-role mode.');
	}
	return mode;
}

function successMessage(
	action: string,
	result: { panel: ReactionRolePanelWithOptions; warnings: string[] },
): string {
	const warningText =
		result.warnings.length > 0
			? `\nWarnings:\n${result.warnings.map((warning) => `• ${warning}`).join('\n')}`
			: '';
	return `${action} panel **${result.panel.panel.name}**: [open message](${messageUrl(result.panel.panel)})${warningText}`;
}

function messageUrl(panel: {
	discordGuildId: string;
	discordChannelId: string;
	discordMessageId: string;
}): string {
	return `https://discord.com/channels/${panel.discordGuildId}/${panel.discordChannelId}/${panel.discordMessageId}`;
}
