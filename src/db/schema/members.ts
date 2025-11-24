import { integer, pgTable, serial } from 'drizzle-orm/pg-core';
import { guilds } from './guilds';
import { users } from './users';

export const members = pgTable('members', {
	userId: serial('user_id')
		.notNull()
		.references(() => users.id),
	guildId: serial('guild_id')
		.notNull()
		.references(() => guilds.id),
	messageCount: integer('message_count').default(0).notNull(),
});
