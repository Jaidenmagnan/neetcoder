import { eq } from 'drizzle-orm';
import type { Guild } from '../../types/guild';
import { db } from '../db';
import { guilds } from '../schema/guilds';

export class GuildRepository {
	async findOneOrCreateByDiscordId(discordGuildId: string): Promise<Guild> {
		let guild = await this.findOneByDiscordId(discordGuildId);

		if (!guild) {
			guild = await this.insert(discordGuildId);
		}

		return guild;
	}

	async findOneByDiscordId(discordGuildId: string): Promise<Guild | undefined> {
		return db.query.guilds.findFirst({
			where: eq(guilds.discordGuildId, discordGuildId),
		});
	}

	async insert(discordGuildId: string): Promise<Guild> {
		const guild: Guild[] = (await db
			.insert(guilds)
			.values({
				discordGuildId: discordGuildId,
			})
			.returning()) as unknown as Guild[];

		return guild[0];
	}
}
