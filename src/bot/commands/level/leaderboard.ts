import {
	type ChatInputCommandInteraction,
	type GuildMember as DiscordGuildMember,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import {
	discordGuildAdapter,
	levelService,
	memberService,
} from '../../../di/container';
import type { Member } from '../../../types/member';

export const data: SlashCommandBuilder = new SlashCommandBuilder()
	.setName('leaderboard')
	.setDescription('Displays the level leaderboard for the server');

export async function execute(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	await interaction.deferReply();

	const guildMember = interaction.member as DiscordGuildMember;

	const member: Member = await memberService.ensureMember(
		guildMember.user.id,
		guildMember.guild.id,
	);

	const leaderboard: Member[] = await levelService.getLeaderboard(
		member.guildId,
		5,
	);

	const discordMembersFromLeaderboard: DiscordGuildMember[] =
		await discordGuildAdapter.resolve(leaderboard);

	const leaderboardEmbed = new EmbedBuilder()
		.setTitle('WHO HAS THE MOST AURA?')
		.setColor('#B8D4F0')
		.setTimestamp();

	await Promise.all(
		leaderboard.map(async (member, i) => {
			const discordMember: DiscordGuildMember =
				discordMembersFromLeaderboard[i];

			const level: number = await levelService.getLevel(member);

			let trophy = '';
			if (i === 0) trophy = '🥇';
			else if (i === 1) trophy = '🥈';
			else if (i === 2) trophy = '🥉';

			leaderboardEmbed.addFields({
				name: `${trophy} #${i + 1}`,
				value: `<@${discordMember.user.id}> - ${level} aura`,
				inline: false,
			});
		}),
	);

	await interaction.editReply({ embeds: [leaderboardEmbed] });
}
