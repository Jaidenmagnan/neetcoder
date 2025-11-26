import {
	type CommandInteraction,
	EmbedBuilder,
	type GuildMember,
	SlashCommandBuilder,
} from 'discord.js';
import {
	discordService,
	levelService,
	memberService,
} from '../../../di/container';
import type { Member } from '../../../types/member';

export const data: SlashCommandBuilder = new SlashCommandBuilder()
	.setName('leaderboard')
	.setDescription('Displays the level leaderboard for the server');

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();

	const guildMember = interaction.member as GuildMember;

	const member: Member = await memberService.ensureMember(
		guildMember.user.id,
		guildMember.guild.id,
	);

	const leaderboard: Member[] = await levelService.getLeaderboard(
		member.guildId,
		5,
	);

	const leaderboardEmbed = new EmbedBuilder()
		.setTitle('WHO HAS THE MOST AURA?')
		.setColor('#B8D4F0')
		.setTimestamp();

	await Promise.all(
		leaderboard.map(async (member, i) => {
			const discordMember: GuildMember = await discordService
				.getDiscordGuildMembers(member.guildId, [member.userId])
				.then((members) => members[0]);

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
