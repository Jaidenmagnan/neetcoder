import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { guilds } from './guilds';

export const channels = pgTable('channels', {
	id: serial('id').primaryKey(),
	guildId: integer('guild_id')
		.notNull()
		.references(() => guilds.id),
	discordChannelId: varchar('discord_channel_id').unique().notNull(),
});
