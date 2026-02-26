import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { channels } from './channels';

export const feeds = pgTable('feeds', {
    id: serial('id').primaryKey(),
    feedUrl: text("feed_url").notNull(),
    lastGuid: text("last_guid"),
    channelId: integer('channel_id').notNull().references(() => channels.id),
});
