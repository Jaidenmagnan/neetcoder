import type { Client, GuildMember } from 'discord.js';
import type { GuildRepository } from '../db/repositories/guildRepository';
import type { UserRepository } from '../db/repositories/userRepository';
import type { User } from '../types/user';

export class DiscordService {
	constructor(
		private client: Client,
		private userRepository: UserRepository,
		private guildRepository: GuildRepository,
	) {}
	async getDiscordGuildMembers(
		guildId: number,
		userIds: number[],
	): Promise<GuildMember[]> {
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
}
