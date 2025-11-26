import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

import { GuildRepository } from '../db/repositories/guildRepository';
import { MemberRepository } from '../db/repositories/memberRepository';
import { UserRepository } from '../db/repositories/userRepository';

import { DiscordService } from '../services/discordService';
import { LevelService } from '../services/levelService';
import { MemberService } from '../services/memberService';

export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
	],
});

// repositories
export const guildRepository = new GuildRepository();
export const userRepository = new UserRepository();

export const memberRepository = new MemberRepository(
	userRepository,
	guildRepository,
);

// services
export const discordService = new DiscordService(
	client,
	userRepository,
	guildRepository,
);

export const levelService = new LevelService(memberRepository);
export const memberService = new MemberService(memberRepository);

export async function startClient() {
	client.login(process.env.TOKEN).catch((err) => {
		console.error('could not login to neetcoder!', err);
		process.exit(1);
	});
}
