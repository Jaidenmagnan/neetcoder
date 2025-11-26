import type { MemberRepository } from '../db/repositories/memberRepository';
import type { Member } from '../types/member';

export class LevelService {
	constructor(private memberRepository: MemberRepository) {}

	async getLevel(member: Member): Promise<number> {
		return this.calculateLevel(member.messageCount);
	}

	async incrementMessageCount(member: Member): Promise<Member> {
		member.messageCount += 1;

		return await this.memberRepository.update(member);
	}

	async getLeaderboard(guildId: number, limit: number): Promise<Member[]> {
		return await this.memberRepository.findAllByGuildId(guildId, limit);
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
