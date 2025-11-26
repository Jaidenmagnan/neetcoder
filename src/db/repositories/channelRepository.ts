import { and, eq } from 'drizzle-orm';
import { db } from '../../db/db';
import type { Channel } from '../../types/channel';
import { channels } from '../schema/channels';
import { guilds } from '../schema/guilds';
import type { GuildRepository } from './guildRepository';

export class ChannelRepository {
	constructor(private guildRepository: GuildRepository) {}

	async insert(discordGuildId: string, discordChannelId: string) {
		const guild =
			await this.guildRepository.findOneOrCreateByDiscordId(discordGuildId);

		return await db
			.insert(channels)
			.values({
				guildId: guild.id,
				discordChannelId: discordChannelId,
			})
			.returning()
			.then((result) => result[0]);
	}

	async find(id: number): Promise<Channel | undefined> {
		return db.query.channels.findFirst({
			where: eq(channels.id, id),
		});
	}

	async findOneOrCreateByDiscordIds(
		discordGuildId: string,
		discordChannelId: string,
	): Promise<Channel> {
		let channel = await this.findByDiscordIds(discordGuildId, discordChannelId);

		if (!channel) {
			channel = await this.insert(discordGuildId, discordChannelId);
		}
		return channel;
	}

	async findByDiscordIds(
		discordGuildId: string,
		discordChannelId: string,
	): Promise<Channel | undefined> {
		return await db
			.select({ channel: channels })
			.from(channels)
			.innerJoin(guilds, eq(channels.guildId, guilds.id))
			.where(
				and(
					eq(channels.discordChannelId, discordChannelId),
					eq(guilds.discordGuildId, discordGuildId),
				),
			)
			.then((result) => result[0]?.channel as Channel | undefined);
	}
}
