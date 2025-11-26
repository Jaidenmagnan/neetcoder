import type { ChannelRepository } from '../db/repositories/channelRepository';
import type { Channel } from '../types/channel';

export class ChannelService {
	constructor(private channelRepository: ChannelRepository) {}

	async ensureChannel(
		discordGuildId: string,
		discordChannelId: string,
	): Promise<Channel> {
		return this.channelRepository.findOneOrCreateByDiscordIds(
			discordGuildId,
			discordChannelId,
		);
	}
}
