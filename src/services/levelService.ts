import { MemberRepository } from '../db/repositories/memberRepository';
import type { Member } from '../types/member';

const memberRepository = new MemberRepository();

export class LevelService {
	async getLevel(member: Member): Promise<number> {
		return this.calculateLevel(member.messageCount);
	}

	async incrementMessageCount(member: Member): Promise<Member> {
		member.messageCount += 1;

		return await memberRepository.update(member);
	}

	async getLeaderboard(guildId: number, limit: number): Promise<Member[]> {
		return await memberRepository.findAllByGuildId(guildId, limit);
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
