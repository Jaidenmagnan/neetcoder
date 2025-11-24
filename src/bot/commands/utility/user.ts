import { type CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { MemberRepository } from '../../../db/repositories/memberRepository';
import type { Member } from '../../../types/member';

export const data: SlashCommandBuilder = new SlashCommandBuilder()
	.setName('user')
	.setDescription('Replies with the user name');

export async function execute(interaction: CommandInteraction) {
	const memberRepository = new MemberRepository();

	const discordGuildId = interaction.guildId;
	const discordUserId = interaction.user.id;

	const member: Member = await memberRepository.findOneOrCreateByDiscordIds(
		discordUserId as string,
		discordGuildId as string,
	);
	return interaction.reply({ content: member.id.toString() });
}
