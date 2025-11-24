import type { GuildMember } from 'discord.js';
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
	const guildMember: GuildMember = interaction.member as GuildMember;

	await interaction.deferReply();
	const levelService = new LevelService();

	const level = await levelService.getLevel(
		guildMember.user.id,
		guildMember.guild.id,
	);

	const levelCard: EmbedBuilder = new EmbedBuilder()
		.setAuthor({
			name: guildMember.user.displayName,
			iconURL: guildMember.user.displayAvatarURL(),
		})
		.setDescription(`** AURA LEVEL ${level}**`)
		.setTimestamp();

	await interaction.editReply({ embeds: [levelCard] });
}
