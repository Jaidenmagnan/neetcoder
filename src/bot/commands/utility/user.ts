import { type CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { UserRepository } from '../../../db/repositories/userRepository';
import type { User } from '../../../types/user';

export const data: SlashCommandBuilder = new SlashCommandBuilder()
	.setName('user')
	.setDescription('Replies with the user name');

export async function execute(interaction: CommandInteraction) {
	const userRepository = new UserRepository();
	const user: User = await userRepository.findOneOrCreateByDiscordId(
		interaction.user.id,
	);
	return interaction.reply({ content: user.discordUserId });
}
