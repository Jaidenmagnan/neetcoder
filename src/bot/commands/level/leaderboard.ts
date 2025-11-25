import {
	type CommandInteraction,
	type GuildMember,
	SlashCommandBuilder,
} from 'discord.js';
import { LevelService } from '../../../services/levelService';
import { MemberService } from '../../../services/memberService';

const levelService = new LevelService();
const memberService = new MemberService();

export const data = new SlashCommandBuilder()
	.setName('leaderboard')
	.setDescription('Displays the level leaderboard for the server');

export async function execute(interaction: CommandInteraction) {
	const guildMember = interaction.member as GuildMember;

	const member = await memberService.ensureMember(
		guildMember.user.id,
		guildMember.guild.id,
	);

	const leaderboard = await levelService.getLeaderboard(member.guildId, 5);
	console.log(leaderboard);

	await interaction.reply('wip');
}
