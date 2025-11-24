import type { User } from 'discord.js';
import {
	type CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import { LevelService } from '../../../services/LevelService';

export const data: SlashCommandBuilder = new SlashCommandBuilder()
	.setName('level')
	.setDescription('Replies with the user name');

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();
	const levelService = new LevelService();

	const level = await levelService.getLevel(
		interaction.user.id,
		interaction.guild?.id,
	);

	const discordUser: User = await interaction.client.users.fetch(
		interaction.user.id,
	);
	const level_card: EmbedBuilder = new EmbedBuilder()
		.setAuthor({
			name: discordUser.displayName,
			iconURL: discordUser.displayAvatarURL(),
		})
		.setDescription(`** AURA LEVEL ${level}**`)
		.setTimestamp();

	await interaction.editReply({ embeds: [level_card] });
}
