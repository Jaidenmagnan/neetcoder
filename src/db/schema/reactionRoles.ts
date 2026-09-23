import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';
import { channels } from './channels';
import { guilds } from './guilds';

export const reactionRoleMode = pgEnum('reaction_role_mode', [
	'normal',
	'exclusive',
]);

export const reactionRolePanels = pgTable(
	'reaction_role_panels',
	{
		id: serial('id').primaryKey(),
		guildId: integer('guild_id')
			.notNull()
			.references(() => guilds.id),
		channelId: integer('channel_id')
			.notNull()
			.references(() => channels.id),
		name: varchar('name', { length: 32 }).notNull(),
		discordMessageId: varchar('discord_message_id').notNull(),
		mode: reactionRoleMode('mode').notNull(),
		isManagedMessage: boolean('is_managed_message').notNull(),
		title: varchar('title', { length: 100 }),
		description: text('description'),
	},
	(table) => [
		uniqueIndex('reaction_role_panels_guild_name_unique').on(
			table.guildId,
			table.name,
		),
		uniqueIndex('reaction_role_panels_guild_message_unique').on(
			table.guildId,
			table.discordMessageId,
		),
		index('reaction_role_panels_message_idx').on(table.discordMessageId),
	],
);

export const reactionRoleOptions = pgTable(
	'reaction_role_options',
	{
		id: serial('id').primaryKey(),
		panelId: integer('panel_id')
			.notNull()
			.references(() => reactionRolePanels.id, { onDelete: 'cascade' }),
		discordRoleId: varchar('discord_role_id').notNull(),
		emojiKey: varchar('emoji_key', { length: 255 }).notNull(),
		emojiDisplay: varchar('emoji_display', { length: 255 }).notNull(),
	},
	(table) => [
		uniqueIndex('reaction_role_options_panel_role_unique').on(
			table.panelId,
			table.discordRoleId,
		),
		uniqueIndex('reaction_role_options_panel_emoji_unique').on(
			table.panelId,
			table.emojiKey,
		),
	],
);
