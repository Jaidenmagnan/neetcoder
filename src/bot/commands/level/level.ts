import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { levelService, memberService } from '../../../di/container';

export const data = new SlashCommandBuilder()
	.setName('level')
	.setDescription('Replies with the user name')

	.addUserOption((option) =>
		option
			.setName('user')
			.setDescription('The user to get the level of')
			.setRequired(false),
	);

export async function execute(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	const guildMember: GuildMember = (interaction.options.getMember('user') ??
		interaction.member) as GuildMember;

	await interaction.deferReply();

	const member = await memberService.ensureMember(
		guildMember.user.id,
		guildMember.guild.id,
	);

	const level = await levelService.getLevel(member);

	const levelCard: EmbedBuilder = new EmbedBuilder()
		.setAuthor({
			name: guildMember.user.displayName,
			iconURL: guildMember.user.displayAvatarURL(),
		})
		.setDescription(`** AURA LEVEL ${level}**`)
		.setTimestamp();

	await interaction.editReply({ embeds: [levelCard] });
}
