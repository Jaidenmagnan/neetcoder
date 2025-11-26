import type { GuildRepository } from '../db/repositories/guildRepository';
import { channelRepository } from '../di/container';
import type { Channel } from '../types/channel';

export class WelcomeLogService {
	constructor(private guildRepository: GuildRepository) {}

	async setChannel(channel: Channel): Promise<Channel> {
		const guild = await this.guildRepository.find(channel.guildId);

		if (!guild) {
			throw new Error('Guild not found');
		}

		guild.welcomeChannelId = channel.id;

		await this.guildRepository.update(guild);

		return channel;
	}

	async getWelcomeLogChannel(guildId: number): Promise<Channel | undefined> {
		const guild = await this.guildRepository.find(guildId);

		if (!guild || !guild.welcomeChannelId) {
			return undefined;
		}

		return channelRepository.find(guild.welcomeChannelId);
	}
}
