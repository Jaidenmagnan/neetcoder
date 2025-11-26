import type {
	ChatInputCommandInteraction,
	SlashCommandChannelOption,
	SlashCommandSubcommandBuilder,
} from 'discord.js';

export const data = (subcommand: SlashCommandSubcommandBuilder) =>
	subcommand
		.setName('auditlog')
		.setDescription('Set the audit log channel')
		.addChannelOption((option: SlashCommandChannelOption) =>
			option
				.setName('channel')
				.setDescription('The channel to use')
				.setRequired(true),
		);

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel');
	// Your logic here
	await interaction.reply(`Audit log channel set to ${channel}`);
};
