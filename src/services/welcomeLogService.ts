import type { DiscordAdapter } from '../adapters/discordAdapter';
import type { ChannelRepository } from '../db/repositories/channelRepository';
import type { GuildRepository } from '../db/repositories/guildRepository';
import type { Channel } from '../types/channel';
import type { Member } from '../types/member';

export class WelcomeLogService {
	constructor(
		private guildRepository: GuildRepository,
		private channelRepository: ChannelRepository,
		private discordAdapter: DiscordAdapter,
	) {}

	async setChannel(channel: Channel): Promise<Channel> {
		const guild = await this.guildRepository.find(channel.guildId);

		if (!guild) {
			throw new Error('Guild not found');
		}

		guild.welcomeChannelId = channel.id;

		await this.guildRepository.update(guild);

		return channel;
	}

	async logWelcomeMessage(member: Member): Promise<Channel | undefined> {
		const guild = await this.guildRepository.find(member.guildId);

		if (!guild || !guild.welcomeChannelId) {
			return undefined;
		}

		const channel: Channel | undefined = await this.channelRepository.find(
			guild.welcomeChannelId,
		);

		if (!channel) {
			return undefined;
		}

		this.discordAdapter.logWelcomeMessage(channel, member);
	}
}
