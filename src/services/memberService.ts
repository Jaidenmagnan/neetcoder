import type { MemberRepository } from '../db/repositories/memberRepository';

export class MemberService {
	constructor(private memberRepository: MemberRepository) {}

	async ensureMember(discordId: string, guildId: string) {
		return this.memberRepository.findOneOrCreateByDiscordIds(
			discordId,
			guildId,
		);
	}
}
