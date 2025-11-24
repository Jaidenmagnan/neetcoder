import type { Member } from '../../types/member';
import { db } from '../db';
import { members } from '../schema/members';
import { GuildRepository } from './guildRepository';
import { UserRepository } from './userRepository';

export class MemberRepository {
	private userRepository: UserRepository;
	private guildRepository: GuildRepository;

	constructor() {
		this.userRepository = new UserRepository();
		this.guildRepository = new GuildRepository();
	}
	async findOneOrCreateByDiscordIds(
		discordUserId: string,
		discordGuildId: string,
	) {
		const user =
			await this.userRepository.findOneOrCreateByDiscordId(discordUserId);
		const guild =
			await this.guildRepository.findOneOrCreateByDiscordId(discordGuildId);

		let member = await this.findMemberByIds(user.id, guild.id);

		if (!member) {
			member = await this.insert(user.id, guild.id);
		}

		return member;
	}
	async insert(userId: number, guildId: number): Promise<Member> {
		const member: Member[] = (await db
			.insert(members)
			.values({
				userId: userId,
				guildId: guildId,
			})
			.returning()) as unknown as Member[];

		return member[0];
	}

	async findMemberByIds(
		userId: number,
		guildId: number,
	): Promise<Member | undefined> {
		return db.query.members.findFirst({
			where: (fields, { eq, and }) =>
				and(eq(fields.userId, userId), eq(fields.guildId, guildId)),
		});
	}
}
