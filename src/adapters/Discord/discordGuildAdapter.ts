import type { Client, GuildMember as DiscordGuildMember } from 'discord.js';
import type { GuildRepository } from '../../db/repositories/guildRepository';
import type { UserRepository } from '../../db/repositories/userRepository';
import type { Member } from '../../types/member';
import type { User } from '../../types/user';

export class DiscordGuildAdapter {
	constructor(
		private client: Client,
		private userRepository: UserRepository,
		private guildRepository: GuildRepository,
	) {}

	async resolve(members: Member[]): Promise<DiscordGuildMember[]> {
		const guildId = members[0]?.guildId;
		if (!guildId || members.length === 0) return [];

		const userIds = members.map((m) => m.userId);

		const users = (await this.userRepository.find(userIds)) as
			| User[]
			| undefined;

		const guild = await this.guildRepository.find(guildId);

		if (!users || !guild?.discordGuildId) {
			return [];
		}

		const userById = new Map<number, User>();
		for (const u of users) {
			if (u?.id) userById.set(u.id, u);
		}

		const discordIdsInOrder = members
			.map((m) => userById.get(m.userId)?.discordUserId)
			.filter((id): id is string => Boolean(id));

		const discordGuild = await this.client.guilds.fetch(guild.discordGuildId);

		const fetched = await discordGuild.members.fetch({
			user: discordIdsInOrder,
		});

		const fetchedById = new Map<string, DiscordGuildMember>();
		for (const gm of fetched.values()) fetchedById.set(gm.user.id, gm);

		return discordIdsInOrder
			.map((id) => fetchedById.get(id))
			.filter((gm): gm is DiscordGuildMember => Boolean(gm));
	}
}
