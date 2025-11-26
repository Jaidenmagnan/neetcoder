import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const guilds = pgTable('guilds', {
	id: serial('id').primaryKey(),
	discordGuildId: varchar('discord_guild_id').unique().notNull(),
	welcomeChannelId: integer('welcome_channel_id'),
});
