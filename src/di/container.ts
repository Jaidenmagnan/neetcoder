import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { DiscordChannelAdapter } from '../adapters/Discord/discordChannelAdapter';
import { DiscordGuildAdapter } from '../adapters/Discord/discordGuildAdapter';
import { ChannelRepository } from '../db/repositories/channelRepository';
import { GuildRepository } from '../db/repositories/guildRepository';
import { MemberRepository } from '../db/repositories/memberRepository';
import { UserRepository } from '../db/repositories/userRepository';
import { ChannelService } from '../services/channelService';
import { LevelService } from '../services/levelService';
import { MemberService } from '../services/memberService';
import { WelcomeLogService } from '../services/welcomeLogService';

export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
	],
});

// repositories
export const guildRepository = new GuildRepository();
export const userRepository = new UserRepository();

export const memberRepository = new MemberRepository(
	userRepository,
	guildRepository,
);

export const channelRepository = new ChannelRepository(guildRepository);

// adapters
export const discordChannelAdapter = new DiscordChannelAdapter(
	client,
	guildRepository,
);

export const discordGuildAdapter = new DiscordGuildAdapter(
	client,
	userRepository,
	guildRepository,
);

// services
export const levelService = new LevelService(memberRepository);
export const memberService = new MemberService(memberRepository);
export const channelService = new ChannelService(channelRepository);

export const welcomeLogService = new WelcomeLogService(
	guildRepository,
	channelRepository,
);

export async function startClient() {
	client.login(process.env.TOKEN).catch((err) => {
		console.error('could not login to neetcoder!', err);
		process.exit(1);
	});
}
