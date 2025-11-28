import type { Client, Channel as DiscordChannel } from 'discord.js';
import type { GuildRepository } from '../../db/repositories/guildRepository';
import type { Channel } from '../../types/channel';

export class DiscordChannelAdapter {
	constructor(
		private client: Client,
		private guildRepository: GuildRepository,
	) {}

	async resolve(channel: Channel): Promise<DiscordChannel | null> {
		const guildId = channel.guildId;

		if (!channel) {
			return null;
		}

		const guild = await this.guildRepository.find(guildId);

		if (!guild?.discordGuildId) {
			return null;
		}

		const discordGuild = await this.client.guilds.fetch(
			guild?.discordGuildId || '',
		);

		return discordGuild.channels.fetch(channel.discordChannelId);
	}
}
