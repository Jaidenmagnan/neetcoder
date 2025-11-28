import type {
	ChatInputCommandInteraction,
	GuildMember as DiscordGuildMember,
	TextChannel as DiscordTextChannel,
	SlashCommandChannelOption,
	SlashCommandSubcommandBuilder,
} from 'discord.js';
import { channelService, welcomeLogService } from '../../../../di/container';

export const data = (subcommand: SlashCommandSubcommandBuilder) =>
	subcommand
		.setName('welcomelog')
		.setDescription('Set the welcome log channel')
		.addChannelOption((option: SlashCommandChannelOption) =>
			option
				.setName('channel')
				.setDescription('The channel to use')
				.setRequired(true),
		);

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const guildMember = interaction.member as DiscordGuildMember;
	const channelOption: DiscordTextChannel | null =
		interaction.options.getChannel('channel');

	// note: this should never run because we set required to true, but its needed for dumb ah ts
	if (!channelOption) {
		await interaction.reply('Channel option is required.');
		return;
	}

	if (channelOption.isTextBased() === false) {
		await interaction.reply('Please select a text-based channel.');
		return;
	}

	const channel = await channelService.ensureChannel(
		guildMember.guild.id,
		channelOption.id,
	);

	await welcomeLogService.setChannel(channel);

	await interaction.reply(`Welcome log channel set to ${channelOption.name}.`);
};
