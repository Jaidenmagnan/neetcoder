import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../db/db';
import type {
	ReactionRoleMode,
	ReactionRoleOption,
	ReactionRolePanelWithOptions,
	ResolvedReactionRolePanel,
} from '../../types/reactionRole';
import { channels } from '../schema/channels';
import { guilds } from '../schema/guilds';
import {
	reactionRoleOptions,
	reactionRolePanels,
} from '../schema/reactionRoles';
import type { ChannelRepository } from './channelRepository';

export interface CreateReactionRolePanelInput {
	discordGuildId: string;
	discordChannelId: string;
	discordMessageId: string;
	name: string;
	mode: ReactionRoleMode;
	isManagedMessage: boolean;
	title?: string;
	description?: string;
	discordRoleId: string;
	emojiKey: string;
	emojiDisplay: string;
}

export interface AddReactionRoleOptionInput {
	panelId: number;
	discordRoleId: string;
	emojiKey: string;
	emojiDisplay: string;
}

/** Provides persistent, guild-scoped access to reaction-role configuration. */
export class ReactionRoleRepository {
	constructor(private readonly channelRepository: ChannelRepository) {}

	/** Creates a panel and its required initial option atomically. */
	async createPanelWithOption(
		input: CreateReactionRolePanelInput,
	): Promise<ReactionRolePanelWithOptions> {
		const channel = await this.channelRepository.findOneOrCreateByDiscordIds(
			input.discordGuildId,
			input.discordChannelId,
		);

		const created = await db.transaction(async (transaction) => {
			const panel = await transaction
				.insert(reactionRolePanels)
				.values({
					guildId: channel.guildId,
					channelId: channel.id,
					name: input.name,
					discordMessageId: input.discordMessageId,
					mode: input.mode,
					isManagedMessage: input.isManagedMessage,
					title: input.title,
					description: input.description,
				})
				.returning()
				.then((rows) => rows[0]);

			if (!panel) {
				throw new Error('Reaction-role panel insert returned no row.');
			}

			const option = await transaction
				.insert(reactionRoleOptions)
				.values({
					panelId: panel.id,
					discordRoleId: input.discordRoleId,
					emojiKey: input.emojiKey,
					emojiDisplay: input.emojiDisplay,
				})
				.returning()
				.then((rows) => rows[0]);

			if (!option) {
				throw new Error('Reaction-role option insert returned no row.');
			}

			return { panel, option };
		});

		return {
			panel: {
				...created.panel,
				discordGuildId: input.discordGuildId,
				discordChannelId: input.discordChannelId,
			},
			options: [created.option],
		};
	}

	/** Finds a complete panel by its administrator-facing name. */
	async findByGuildAndName(
		discordGuildId: string,
		name: string,
	): Promise<ReactionRolePanelWithOptions | undefined> {
		const panel = await db
			.select({
				panel: reactionRolePanels,
				discordGuildId: guilds.discordGuildId,
				discordChannelId: channels.discordChannelId,
			})
			.from(reactionRolePanels)
			.innerJoin(guilds, eq(reactionRolePanels.guildId, guilds.id))
			.innerJoin(channels, eq(reactionRolePanels.channelId, channels.id))
			.where(
				and(
					eq(guilds.discordGuildId, discordGuildId),
					eq(reactionRolePanels.name, name),
				),
			)
			.then((rows) => rows[0]);

		return panel ? this.withOptions(panel) : undefined;
	}

	/** Finds a complete panel for a gateway reaction event. */
	async findByGuildAndMessage(
		discordGuildId: string,
		discordMessageId: string,
	): Promise<ReactionRolePanelWithOptions | undefined> {
		const panel = await db
			.select({
				panel: reactionRolePanels,
				discordGuildId: guilds.discordGuildId,
				discordChannelId: channels.discordChannelId,
			})
			.from(reactionRolePanels)
			.innerJoin(guilds, eq(reactionRolePanels.guildId, guilds.id))
			.innerJoin(channels, eq(reactionRolePanels.channelId, channels.id))
			.where(
				and(
					eq(guilds.discordGuildId, discordGuildId),
					eq(reactionRolePanels.discordMessageId, discordMessageId),
				),
			)
			.then((rows) => rows[0]);

		return panel ? this.withOptions(panel) : undefined;
	}

	/** Lists resolved panels for one guild in stable name order. */
	async findAllByGuild(
		discordGuildId: string,
	): Promise<ResolvedReactionRolePanel[]> {
		return db
			.select({
				id: reactionRolePanels.id,
				guildId: reactionRolePanels.guildId,
				channelId: reactionRolePanels.channelId,
				name: reactionRolePanels.name,
				discordMessageId: reactionRolePanels.discordMessageId,
				mode: reactionRolePanels.mode,
				isManagedMessage: reactionRolePanels.isManagedMessage,
				title: reactionRolePanels.title,
				description: reactionRolePanels.description,
				discordGuildId: guilds.discordGuildId,
				discordChannelId: channels.discordChannelId,
			})
			.from(reactionRolePanels)
			.innerJoin(guilds, eq(reactionRolePanels.guildId, guilds.id))
			.innerJoin(channels, eq(reactionRolePanels.channelId, channels.id))
			.where(eq(guilds.discordGuildId, discordGuildId))
			.orderBy(asc(reactionRolePanels.name));
	}

	/** Adds one role mapping to an existing panel. */
	async addOption(
		input: AddReactionRoleOptionInput,
	): Promise<ReactionRoleOption> {
		const option = await db
			.insert(reactionRoleOptions)
			.values(input)
			.returning()
			.then((rows) => rows[0]);

		if (!option) {
			throw new Error('Reaction-role option insert returned no row.');
		}

		return option;
	}

	/** Removes and returns a mapping selected by its Discord role ID. */
	async removeOption(
		panelId: number,
		discordRoleId: string,
	): Promise<ReactionRoleOption | undefined> {
		return db
			.delete(reactionRoleOptions)
			.where(
				and(
					eq(reactionRoleOptions.panelId, panelId),
					eq(reactionRoleOptions.discordRoleId, discordRoleId),
				),
			)
			.returning()
			.then((rows) => rows[0]);
	}

	/** Changes a panel's selection behavior. */
	async updateMode(panelId: number, mode: ReactionRoleMode): Promise<void> {
		await db
			.update(reactionRolePanels)
			.set({ mode })
			.where(eq(reactionRolePanels.id, panelId));
	}

	/** Deletes a panel configuration without touching its Discord message. */
	async deletePanel(panelId: number): Promise<void> {
		await db
			.delete(reactionRolePanels)
			.where(eq(reactionRolePanels.id, panelId));
	}

	/** Deletes configuration for a message that no longer exists. */
	async deleteByGuildAndMessage(
		discordGuildId: string,
		discordMessageId: string,
	): Promise<boolean> {
		const panel = await this.findByGuildAndMessage(
			discordGuildId,
			discordMessageId,
		);

		if (!panel) return false;

		await this.deletePanel(panel.panel.id);
		return true;
	}

	private async withOptions(input: {
		panel: typeof reactionRolePanels.$inferSelect;
		discordGuildId: string;
		discordChannelId: string;
	}): Promise<ReactionRolePanelWithOptions> {
		const options = await db
			.select()
			.from(reactionRoleOptions)
			.where(eq(reactionRoleOptions.panelId, input.panel.id))
			.orderBy(asc(reactionRoleOptions.id));

		return {
			panel: {
				...input.panel,
				discordGuildId: input.discordGuildId,
				discordChannelId: input.discordChannelId,
			},
			options,
		};
	}
}
