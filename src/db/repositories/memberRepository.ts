import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/db';
import type { Member } from '../../types/member';
import { guilds } from '../schema/guilds';
import { members } from '../schema/members';
import { users } from '../schema/users';
import type { GuildRepository } from './guildRepository';
import type { UserRepository } from './userRepository';

export class MemberRepository {
	constructor(
		private userRepository: UserRepository,
		private guildRepository: GuildRepository,
	) {}

	async update(member: Member): Promise<Member> {
		return await db
			.update(members)
			.set({ messageCount: member.messageCount })
			.where(eq(members.id, member.id))
			.returning()
			.then((result) => result[0]);
	}

	async findAllByGuildId(guildId: number, limit: number): Promise<Member[]> {
		return await db
			.select()
			.from(members)
			.where(eq(members.guildId, guildId))
			.orderBy(desc(members.messageCount))
			.limit(limit);
	}

	async findOneOrCreateByDiscordIds(
		discordUserId: string,
		discordGuildId: string,
	) {
		let member = await this.findMemberByDiscordIds(
			discordUserId,
			discordGuildId,
		);

		if (!member) {
			member = await this.insert(discordUserId, discordGuildId);
		}

		return member;
	}

	async insert(discordUserId: string, discordGuildId: string): Promise<Member> {
		const user =
			await this.userRepository.findOneOrCreateByDiscordId(discordUserId);
		const guild =
			await this.guildRepository.findOneOrCreateByDiscordId(discordGuildId);

		return await db
			.insert(members)
			.values({
				userId: user.id,
				guildId: guild.id,
				messageCount: 0,
			})
			.returning()
			.then((result) => result[0]);
	}

	async findMemberByDiscordIds(
		discordUserId: string,
		discordGuildId: string,
	): Promise<Member | undefined> {
		return await db
			.select({ member: members })
			.from(members)
			.innerJoin(users, eq(members.userId, users.id))
			.innerJoin(guilds, eq(members.guildId, guilds.id))
			.where(
				and(
					eq(users.discordUserId, discordUserId),
					eq(guilds.discordGuildId, discordGuildId),
				),
			)
			.then((result) => result[0]?.member);
	}
}
