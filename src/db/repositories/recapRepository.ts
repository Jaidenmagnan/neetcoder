import { and, eq, isNull, lte, ne, or } from 'drizzle-orm';
import { db } from '../../db/db';
import type { ResolvedRecapConfiguration } from '../../types/recap';
import { channels } from '../schema/channels';
import { guilds } from '../schema/guilds';
import { recapConfigurations } from '../schema/recaps';
import type { ChannelRepository } from './channelRepository';

export interface UpsertRecapConfigurationInput {
	discordGuildId: string;
	discordSourceChannelId: string;
	discordDestinationChannelId: string;
	time: string;
	timezone: string;
	startsAt: Date;
}

/** Persists the single scheduled recap allowed for each guild. */
export class RecapRepository {
	constructor(private readonly channelRepository: ChannelRepository) {}

	async upsert(
		input: UpsertRecapConfigurationInput,
	): Promise<ResolvedRecapConfiguration> {
		const source = await this.channelRepository.findOneOrCreateByDiscordIds(
			input.discordGuildId,
			input.discordSourceChannelId,
		);
		const destination =
			await this.channelRepository.findOneOrCreateByDiscordIds(
				input.discordGuildId,
				input.discordDestinationChannelId,
			);

		await db
			.insert(recapConfigurations)
			.values({
				guildId: source.guildId,
				sourceChannelId: source.id,
				destinationChannelId: destination.id,
				time: input.time,
				timezone: input.timezone,
				lastSuccessfulRecapAt: input.startsAt,
				lastSuccessfulLocalDate: null,
				claimExpiresAt: null,
			})
			.onConflictDoUpdate({
				target: recapConfigurations.guildId,
				set: {
					sourceChannelId: source.id,
					destinationChannelId: destination.id,
					time: input.time,
					timezone: input.timezone,
					lastSuccessfulRecapAt: input.startsAt,
					lastSuccessfulLocalDate: null,
					claimExpiresAt: null,
				},
			});

		const configuration = await this.findByGuild(input.discordGuildId);
		if (!configuration) {
			throw new Error('Recap configuration upsert returned no row.');
		}
		return configuration;
	}

	async findByGuild(
		discordGuildId: string,
	): Promise<ResolvedRecapConfiguration | undefined> {
		return this.resolvedQuery()
			.where(eq(guilds.discordGuildId, discordGuildId))
			.then((rows) => rows[0]);
	}

	async findAll(): Promise<ResolvedRecapConfiguration[]> {
		return this.resolvedQuery();
	}

	async deleteByGuild(discordGuildId: string): Promise<boolean> {
		const deleted = await db
			.delete(recapConfigurations)
			.where(
				eq(
					recapConfigurations.guildId,
					db
						.select({ id: guilds.id })
						.from(guilds)
						.where(eq(guilds.discordGuildId, discordGuildId)),
				),
			)
			.returning({ id: recapConfigurations.id });
		return deleted.length > 0;
	}

	/** Atomically leases a due run so multiple bot instances cannot duplicate it. */
	async claim(
		configurationId: number,
		localDate: string,
		now: Date,
		leaseExpiresAt: Date,
	): Promise<boolean> {
		const claimed = await db
			.update(recapConfigurations)
			.set({ claimExpiresAt: leaseExpiresAt })
			.where(
				and(
					eq(recapConfigurations.id, configurationId),
					or(
						isNull(recapConfigurations.lastSuccessfulLocalDate),
						ne(recapConfigurations.lastSuccessfulLocalDate, localDate),
					),
					or(
						isNull(recapConfigurations.claimExpiresAt),
						lte(recapConfigurations.claimExpiresAt, now),
					),
				),
			)
			.returning({ id: recapConfigurations.id });
		return claimed.length === 1;
	}

	async complete(
		configurationId: number,
		localDate: string,
		windowEnd: Date,
	): Promise<void> {
		await db
			.update(recapConfigurations)
			.set({
				lastSuccessfulRecapAt: windowEnd,
				lastSuccessfulLocalDate: localDate,
				claimExpiresAt: null,
			})
			.where(eq(recapConfigurations.id, configurationId));
	}

	async release(configurationId: number, retryAt: Date): Promise<void> {
		await db
			.update(recapConfigurations)
			.set({ claimExpiresAt: retryAt })
			.where(eq(recapConfigurations.id, configurationId));
	}

	private resolvedQuery() {
		const sourceChannels = db
			.select({
				id: channels.id,
				discordChannelId: channels.discordChannelId,
			})
			.from(channels)
			.as('recap_source_channels');
		const destinationChannels = db
			.select({
				id: channels.id,
				discordChannelId: channels.discordChannelId,
			})
			.from(channels)
			.as('recap_destination_channels');

		return db
			.select({
				id: recapConfigurations.id,
				guildId: recapConfigurations.guildId,
				sourceChannelId: recapConfigurations.sourceChannelId,
				destinationChannelId: recapConfigurations.destinationChannelId,
				time: recapConfigurations.time,
				timezone: recapConfigurations.timezone,
				lastSuccessfulRecapAt: recapConfigurations.lastSuccessfulRecapAt,
				lastSuccessfulLocalDate: recapConfigurations.lastSuccessfulLocalDate,
				claimExpiresAt: recapConfigurations.claimExpiresAt,
				discordGuildId: guilds.discordGuildId,
				discordSourceChannelId: sourceChannels.discordChannelId,
				discordDestinationChannelId: destinationChannels.discordChannelId,
			})
			.from(recapConfigurations)
			.innerJoin(guilds, eq(recapConfigurations.guildId, guilds.id))
			.innerJoin(
				sourceChannels,
				eq(recapConfigurations.sourceChannelId, sourceChannels.id),
			)
			.innerJoin(
				destinationChannels,
				eq(recapConfigurations.destinationChannelId, destinationChannels.id),
			);
	}
}
