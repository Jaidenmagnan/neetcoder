import type { GuildMember as DiscordGuildMember } from 'discord.js';
import { Events } from 'discord.js';
import { memberService, welcomeLogService } from '../../di/container';
import type { Member } from '../../types/member';

module.exports = {
	name: Events.GuildMemberAdd,
	on: true,
	async execute(discordGuildMember: DiscordGuildMember) {
		console.log('Guild member added event triggered');
		const member: Member = await memberService.ensureMember(
			discordGuildMember.id,
			discordGuildMember.guild.id,
		);

		await welcomeLogService.logWelcomeMessage(member);
	},
};
