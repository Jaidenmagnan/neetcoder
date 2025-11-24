import { and, eq } from 'drizzle-orm';
import type { Member } from '../../types/member';
import { db } from '../db';
import { guilds } from '../schema/guilds';
import { members } from '../schema/members';
import { users } from '../schema/users';
import { GuildRepository } from './guildRepository';
import { UserRepository } from './userRepository';

export class MemberRepository {
	private userRepository: UserRepository;
	private guildRepository: GuildRepository;

	constructor() {
		this.userRepository = new UserRepository();
		this.guildRepository = new GuildRepository();
	}

	async update(member: Member): Promise<Member> {
		await db
			.update(members)
			.set({ messageCount: member.messageCount })
			.where(eq(members.id, member.id));

		return member;
	}

	async ensureMember(
		discordUserId: string,
		discordGuildId: string | undefined,
	): Promise<Member> {
		if (!discordGuildId) {
			throw 'the guild is empty';
		}

		return await this.findOneOrCreateByDiscordIds(
			discordUserId,
			discordGuildId,
		);
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
