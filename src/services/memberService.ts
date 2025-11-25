import { MemberRepository } from '../db/repositories/memberRepository';

export class MemberService {
	async ensureMember(discordId: string, guildId: string) {
		const memberRepository = new MemberRepository();
		return memberRepository.findOneOrCreateByDiscordIds(discordId, guildId);
	}
}
