import {
	Events,
	type GuildMember,
	type Message,
	type TextChannel,
} from 'discord.js';
import { LevelService } from '../../services/levelService';
import { MemberService } from '../../services/memberService';

const levelService = new LevelService();
const memberService = new MemberService();

module.exports = {
	name: Events.MessageCreate,
	on: true,
	async execute(message: Message): Promise<void> {
		if (message.author.bot) return;

		const guildMember: GuildMember = message.member as GuildMember;

		await logMessageCount(message, guildMember);

		await replaceXLink(message);
	},
};

async function logMessageCount(message: Message, guildMember: GuildMember) {
	let member = await memberService.ensureMember(
		guildMember.user.id,
		guildMember.guild.id,
	);

	const previousLevel = await levelService.getLevel(member);

	member = await levelService.incrementMessageCount(member);

	const newLevel = await levelService.getLevel(member);

	if (newLevel > previousLevel) {
		const channel = message.channel as TextChannel;
		await channel.send({
			content: `<@${guildMember.user.id}> you leveled up!`,
		});
	}
}

async function replaceXLink(message: Message) {
	if (message.content.toLowerCase().includes('https://x.com')) {
		let author = message.author.username;

		if (message.member?.nickname) {
			author = message.member.nickname;
		}

		let messageContent = message.content.replace('x.com', 'fixvx.com');

		try {
			messageContent = `**${author} shared a tweet:**\n${messageContent}`;

			const channel = message.channel as TextChannel;

			await channel.send(messageContent);

			await message.delete();
		} catch (error) {
			console.log(error);
		}
	}
}
