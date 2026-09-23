import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { DiscordChannelAdapter } from '../adapters/Discord/discordChannelAdapter';
import { DiscordGuildAdapter } from '../adapters/Discord/discordGuildAdapter';
import { DiscordReactionRoleAdapter } from '../adapters/Discord/discordReactionRoleAdapter';
import { ChannelRepository } from '../db/repositories/channelRepository';
import { GuildRepository } from '../db/repositories/guildRepository';
import { MemberRepository } from '../db/repositories/memberRepository';
import { ReactionRoleRepository } from '../db/repositories/reactionRoleRepository';
import { UserRepository } from '../db/repositories/userRepository';
import { ChannelService } from '../services/channelService';
import { LevelService } from '../services/levelService';
import { MemberService } from '../services/memberService';
import { ReactionRoleService } from '../services/reactionRoleService';
import { WelcomeLogService } from '../services/welcomeLogService';

export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
	],
	partials: [
		Partials.Channel,
		Partials.Message,
		Partials.Reaction,
		Partials.User,
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
export const reactionRoleRepository = new ReactionRoleRepository(
	channelRepository,
);

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
export const discordReactionRoleAdapter = new DiscordReactionRoleAdapter(
	client,
);

// services
export const levelService = new LevelService(memberRepository);
export const memberService = new MemberService(memberRepository);
export const channelService = new ChannelService(channelRepository);

export const welcomeLogService = new WelcomeLogService(
	guildRepository,
	channelRepository,
);

export const reactionRoleService = new ReactionRoleService(
	reactionRoleRepository,
	discordReactionRoleAdapter,
);

export async function startClient() {
	client.login(process.env.TOKEN).catch((err) => {
		console.error('could not login to neetcoder!', err);
		process.exit(1);
	});
}
