import { Events, type GuildMember, type Message } from 'discord.js';
import { LevelService } from '../../services/LevelService';
import { MemberService } from '../../services/MemberService';

const levelService = new LevelService();
const memberService = new MemberService();

module.exports = {
	name: Events.MessageCreate,
	on: true,
	async execute(message: Message): Promise<void> {
		if (message.author.bot) return;

		const guildMember: GuildMember = message.member as GuildMember;

		let member = await memberService.ensureMember(
			guildMember.user.id,
			guildMember.guild.id,
		);

		const previousLevel = await levelService.getLevel(member);

		member = await levelService.incrementMessageCount(member);

		const newLevel = await levelService.getLevel(member);

		if (newLevel > previousLevel) {
			await message.reply({
				content: `<@${guildMember.user.id}> you leveled up!`,
			});
		}
	},
};
