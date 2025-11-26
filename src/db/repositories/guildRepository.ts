import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import type { Guild } from '../../types/guild';
import { guilds } from '../schema/guilds';

export class GuildRepository {
	async findOneOrCreateByDiscordId(discordGuildId: string): Promise<Guild> {
		let guild = await this.findOneByDiscordId(discordGuildId);

		if (!guild) {
			guild = await this.insert(discordGuildId);
		}

		return guild;
	}

	async find(id: number): Promise<Guild | undefined> {
		return db.query.guilds.findFirst({
			where: eq(guilds.id, id),
		});
	}

	async findOneByDiscordId(discordGuildId: string): Promise<Guild | undefined> {
		return db.query.guilds.findFirst({
			where: eq(guilds.discordGuildId, discordGuildId),
		});
	}

	async insert(discordGuildId: string): Promise<Guild> {
		return await db
			.insert(guilds)
			.values({
				discordGuildId: discordGuildId,
			})
			.returning()
			.then((result) => result[0]);
	}
}
