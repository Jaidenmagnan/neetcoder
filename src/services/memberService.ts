import type { MemberRepository } from '../db/repositories/memberRepository';

export class MemberService {
	constructor(private memberRepository: MemberRepository) {}

	async ensureMember(discordUserId: string, discordGuildId: string) {
		return this.memberRepository.findOneOrCreateByDiscordIds(
			discordUserId,
			discordGuildId,
		);
	}
}
