import type {
	ChatInputCommandInteraction,
	SlashCommandSubcommandGroupBuilder,
} from 'discord.js';

import { SlashCommandBuilder } from 'discord.js';
import * as auditLog from './setChannel/auditLog';
import * as welcomeLog from './setChannel/welcomeLog';

export const data = new SlashCommandBuilder()
	.setName('config')
	.setDescription('configuration commands')
	.addSubcommandGroup((group: SlashCommandSubcommandGroupBuilder) =>
		group
			.setName('setchannel')
			.setDescription('set channels for certain bot features')
			.addSubcommand(welcomeLog.data)
			.addSubcommand(auditLog.data),
	);

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const group = interaction.options.getSubcommandGroup();
	const subcommand = interaction.options.getSubcommand();

	if (group === 'setchannel') {
		if (subcommand === 'welcomelog') {
			await welcomeLog.execute(interaction);
		} else if (subcommand === 'auditlog') {
			await auditLog.execute(interaction);
		}
	}
};
