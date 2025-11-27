import type {
	Client,
	Channel as DiscordChannel,
	GuildMember,
	TextChannel,
} from 'discord.js';
import type { GuildRepository } from '../db/repositories/guildRepository';
import type { UserRepository } from '../db/repositories/userRepository';
import type { Channel } from '../types/channel';
import type { Member } from '../types/member';
import type { User } from '../types/user';

export class DiscordAdapter {
	constructor(
		private client: Client,
		private userRepository: UserRepository,
		private guildRepository: GuildRepository,
	) {}
	async getDiscordGuildMembers(members: Member[]): Promise<GuildMember[]> {
		const guildId = members[0]?.guildId;
		const userIds = members.map((m) => m.userId);

		const users = (await this.userRepository.find(userIds)) as
			| User[]
			| undefined;
		const guild = await this.guildRepository.find(guildId);

		if (!users || !guild?.discordGuildId) {
			return [];
		}

		const discordGuild = await this.client.guilds.fetch(
			guild?.discordGuildId || '',
		);

		return Array.from(
			(
				await discordGuild.members.fetch({
					user: users.map((u) => u.discordUserId),
				})
			).values(),
		);
	}

	async logWelcomeMessage(channel: Channel, member: Member): Promise<void> {
		const discordChannel: TextChannel | null = (await this.getDiscordChannel(
			channel,
		)) as TextChannel | null;

		if (!discordChannel || !discordChannel.isTextBased()) {
			return;
		}

		const discordGuildMember = await this.getDiscordGuildMembers([member]).then(
			(members) => members[0],
		);

		await discordChannel.send(
			`Welcome to the server, <@${discordGuildMember.id}>!`,
		);
	}

	async getDiscordChannel(channel: Channel): Promise<DiscordChannel | null> {
		const guildId = channel.guildId;

		if (!channel) {
			return null;
		}

		const guild = await this.guildRepository.find(guildId);

		if (!guild?.discordGuildId) {
			return null;
		}

		const discordGuild = await this.client.guilds.fetch(
			guild?.discordGuildId || '',
		);

		return discordGuild.channels.fetch(channel.discordChannelId);
	}
}
