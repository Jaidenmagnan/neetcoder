import {
	index,
	integer,
	pgTable,
	serial,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';
import { channels } from './channels';
import { guilds } from './guilds';

export const recapConfigurations = pgTable(
	'recap_configurations',
	{
		id: serial('id').primaryKey(),
		guildId: integer('guild_id')
			.notNull()
			.references(() => guilds.id, { onDelete: 'cascade' }),
		sourceChannelId: integer('source_channel_id')
			.notNull()
			.references(() => channels.id),
		destinationChannelId: integer('destination_channel_id')
			.notNull()
			.references(() => channels.id),
		time: varchar('time', { length: 5 }).notNull(),
		timezone: varchar('timezone', { length: 64 }).notNull(),
		lastSuccessfulRecapAt: timestamp('last_successful_recap_at', {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
		lastSuccessfulLocalDate: varchar('last_successful_local_date', {
			length: 10,
		}),
		claimExpiresAt: timestamp('claim_expires_at', { withTimezone: true }),
	},
	(table) => [
		uniqueIndex('recap_configurations_guild_unique').on(table.guildId),
		index('recap_configurations_claim_idx').on(table.claimExpiresAt),
	],
);
