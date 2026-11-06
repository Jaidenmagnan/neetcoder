import type {
	RecapDiscordGateway,
	ValidateRecapConfigurationInput,
} from '../adapters/Discord/discordRecapAdapter';
import type { RecapRepository } from '../db/repositories/recapRepository';
import type { RecapPreview, ResolvedRecapConfiguration } from '../types/recap';
import type { RecapSummarizer } from './openAIRecapSummarizer';
import { RecapError } from './recapErrors';

const MESSAGE_LIMIT = 1_000;
const LEASE_MILLISECONDS = 10 * 60 * 1_000;
const RETRY_MILLISECONDS = 15 * 60 * 1_000;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export type RecapStore = Pick<
	RecapRepository,
	| 'claim'
	| 'complete'
	| 'deleteByGuild'
	| 'findAll'
	| 'findByGuild'
	| 'release'
	| 'upsert'
>;

export interface ConfigureRecapInput extends ValidateRecapConfigurationInput {
	time: string;
	timezone: string;
}

/** Coordinates recap configuration, previews, and idempotent scheduled runs. */
export class RecapService {
	constructor(
		private readonly repository: RecapStore,
		private readonly discordGateway: RecapDiscordGateway,
		private readonly summarizer: RecapSummarizer,
	) {}

	async configure(
		input: ConfigureRecapInput,
	): Promise<ResolvedRecapConfiguration> {
		this.validateSchedule(input.time, input.timezone);
		await this.discordGateway.validateConfiguration(input);
		return this.repository.upsert({ ...input, startsAt: new Date() });
	}

	async getConfiguration(
		discordGuildId: string,
	): Promise<ResolvedRecapConfiguration | undefined> {
		return this.repository.findByGuild(discordGuildId);
	}

	async disable(discordGuildId: string): Promise<boolean> {
		return this.repository.deleteByGuild(discordGuildId);
	}

	async preview(
		discordGuildId: string,
		now = new Date(),
	): Promise<RecapPreview> {
		const configuration = await this.requireConfiguration(discordGuildId);
		const preview = await this.createPreview(configuration, now);
		if (preview.messageCount === 0) {
			throw new RecapError(
				'no-messages',
				'There are no messages to recap since the last successful run.',
			);
		}
		return preview;
	}

	async runDue(now = new Date()): Promise<void> {
		const configurations = await this.repository.findAll();
		for (const configuration of configurations) {
			const local = localScheduleParts(now, configuration.timezone);
			if (
				local.time < configuration.time ||
				configuration.lastSuccessfulLocalDate === local.date
			) {
				continue;
			}

			const claimed = await this.repository.claim(
				configuration.id,
				local.date,
				now,
				new Date(now.getTime() + LEASE_MILLISECONDS),
			);
			if (!claimed) continue;

			try {
				const preview = await this.createPreview(configuration, now);
				if (preview.messageCount > 0) {
					await this.discordGateway.postRecap(configuration, preview);
				}
				await this.repository.complete(configuration.id, local.date, now);
			} catch (error) {
				await this.repository.release(
					configuration.id,
					new Date(now.getTime() + RETRY_MILLISECONDS),
				);
				console.error('Scheduled recap failed.', {
					guildId: configuration.discordGuildId,
					error,
				});
			}
		}
	}

	private async createPreview(
		configuration: ResolvedRecapConfiguration,
		windowEnd: Date,
	): Promise<RecapPreview> {
		const result = await this.discordGateway.fetchMessages(
			configuration,
			configuration.lastSuccessfulRecapAt,
			windowEnd,
			MESSAGE_LIMIT,
		);
		const content =
			result.messages.length > 0
				? await this.summarizer.summarize(result.messages)
				: {
						topDiscussions: [],
						pointsOfAgreement: [],
						whereViewsDiffer: [],
						notableLinks: [],
					};

		return {
			content,
			messageCount: result.messages.length,
			truncated: result.truncated,
			windowStart: configuration.lastSuccessfulRecapAt,
			windowEnd,
		};
	}

	private async requireConfiguration(
		discordGuildId: string,
	): Promise<ResolvedRecapConfiguration> {
		const configuration = await this.repository.findByGuild(discordGuildId);
		if (!configuration) {
			throw new RecapError(
				'not-configured',
				'This server does not have a daily recap configured.',
			);
		}
		return configuration;
	}

	private validateSchedule(time: string, timezone: string): void {
		if (!TIME_PATTERN.test(time)) {
			throw new RecapError(
				'invalid-schedule',
				'Enter time in 24-hour HH:MM format, such as 21:00.',
			);
		}
		try {
			new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();
		} catch {
			throw new RecapError(
				'invalid-schedule',
				'Enter a valid IANA timezone, such as America/New_York.',
			);
		}
	}
}

export function localScheduleParts(
	date: Date,
	timezone: string,
): { date: string; time: string } {
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
	});
	const parts = Object.fromEntries(
		formatter
			.formatToParts(date)
			.filter((part) => part.type !== 'literal')
			.map((part) => [part.type, part.value]),
	);
	return {
		date: `${parts.year}-${parts.month}-${parts.day}`,
		time: `${parts.hour}:${parts.minute}`,
	};
}
