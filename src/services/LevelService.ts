import { MemberRepository } from '../db/repositories/memberRepository';
import type { Member } from '../types/member';

export class LevelService {
	async getLevel(
		discordUserId: string,
		discordGuildId: string | undefined,
	): Promise<number> {
		const memberRepository = new MemberRepository();

		const member: Member = await memberRepository.ensureMember(
			discordUserId,
			discordGuildId,
		);

		return this.calculateLevel(member.messageCount);
	}

	async incrementLevel(
		discordUserId: string,
		discordGuildId: string | undefined,
	): Promise<Member> {
		const memberRepository = new MemberRepository();

		const member: Member = await memberRepository.ensureMember(
			discordUserId,
			discordGuildId,
		);

		member.messageCount += 1;

		await memberRepository.update(member);

		return member;
	}

	private calculateLevel(messageCount: number): number {
		if (messageCount < 10) {
			return 1;
		}

		if (messageCount < 35) {
			return 2;
		}

		if (messageCount < 85) {
			return 3;
		}

		return 4 + Math.floor((messageCount - 85) / 100);
	}
}
