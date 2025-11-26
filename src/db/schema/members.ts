import { integer, pgTable, serial } from 'drizzle-orm/pg-core';
import { guilds } from './guilds';
import { users } from './users';

export const members = pgTable('members', {
	id: serial('id').primaryKey().notNull(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	guildId: integer('guild_id')
		.notNull()
		.references(() => guilds.id),
	messageCount: integer('message_count').default(0).notNull(),
});
