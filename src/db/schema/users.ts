import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	discordUserId: varchar('discord_user_id').unique().notNull(),
});
