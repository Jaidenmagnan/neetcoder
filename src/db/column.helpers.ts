import { timestamp } from 'drizzle-orm/gel-core';

const _timestamps = {
	updated_at: timestamp(),
	created_at: timestamp().defaultNow().notNull(),
	deleted_at: timestamp(),
};
