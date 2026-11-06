import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import type { RecapDiscordGateway } from '../adapters/Discord/discordRecapAdapter';
import type { RecapContent, ResolvedRecapConfiguration } from '../types/recap';
import type { RecapSummarizer } from './openAIRecapSummarizer';
import { RecapError } from './recapErrors';
import {
	localScheduleParts,
	RecapService,
	type RecapStore,
} from './recapService';

const SUMMARY: RecapContent = {
	topDiscussions: ['A policy proposal was discussed.'],
	pointsOfAgreement: ['Participants agreed on the stated objective.'],
	whereViewsDiffer: ['Participants differed on implementation.'],
	notableLinks: [],
};

describe('RecapService', () => {
	it('recognizes the configured local date and time across UTC boundaries', () => {
		assert.deepEqual(
			localScheduleParts(
				new Date('2026-07-01T01:30:00.000Z'),
				'America/New_York',
			),
			{ date: '2026-06-30', time: '21:30' },
		);
	});

	it('claims, posts, and completes a due recap', async () => {
		const calls: string[] = [];
		const configuration = createConfiguration();
		const service = createService(configuration, calls);
		const now = new Date('2026-07-01T01:05:00.000Z');

		await service.runDue(now);

		assert.deepEqual(calls, [
			'claim:2026-06-30',
			'fetch:1000',
			'summarize:1',
			'post:1',
			`complete:2026-06-30:${now.toISOString()}`,
		]);
	});

	it('skips a day with no messages but still advances the successful cursor', async () => {
		const calls: string[] = [];
		const service = createService(createConfiguration(), calls, false);
		const now = new Date('2026-07-01T01:05:00.000Z');

		await service.runDue(now);

		assert.deepEqual(calls, [
			'claim:2026-06-30',
			'fetch:1000',
			`complete:2026-06-30:${now.toISOString()}`,
		]);
	});

	it('does not run before the configured local time', async () => {
		const calls: string[] = [];
		const service = createService(createConfiguration(), calls);

		await service.runDue(new Date('2026-07-01T00:59:00.000Z'));

		assert.deepEqual(calls, []);
	});

	it('rejects malformed times and unknown timezones before persistence', async () => {
		const service = createService(createConfiguration(), []);
		await assert.rejects(
			service.configure({
				discordGuildId: 'guild-1',
				discordSourceChannelId: 'source-1',
				discordDestinationChannelId: 'destination-1',
				time: '9pm',
				timezone: 'Nowhere/Imaginary',
			}),
			(error: unknown) =>
				error instanceof RecapError && error.code === 'invalid-schedule',
		);
	});
});

function createService(
	configuration: ResolvedRecapConfiguration,
	calls: string[],
	hasMessages = true,
): RecapService {
	const store: RecapStore = {
		claim: async (_id, localDate) => {
			calls.push(`claim:${localDate}`);
			return true;
		},
		complete: async (_id, localDate, windowEnd) => {
			calls.push(`complete:${localDate}:${windowEnd.toISOString()}`);
		},
		deleteByGuild: async () => true,
		findAll: async () => [configuration],
		findByGuild: async () => configuration,
		release: async () => undefined,
		upsert: async () => configuration,
	};
	const gateway: RecapDiscordGateway = {
		validateConfiguration: async () => undefined,
		fetchMessages: async (_configuration, windowStart, _windowEnd, limit) => {
			calls.push(`fetch:${limit}`);
			return {
				messages: hasMessages
					? [
							{
								author: 'Participant 1',
								content: 'A policy should change.',
								createdAt: new Date(windowStart.getTime() + 1_000),
							},
						]
					: [],
				truncated: false,
			};
		},
		postRecap: async (_configuration, preview) => {
			calls.push(`post:${preview.messageCount}`);
		},
	};
	const summarizer: RecapSummarizer = {
		summarize: async (messages) => {
			calls.push(`summarize:${messages.length}`);
			return SUMMARY;
		},
	};
	return new RecapService(store, gateway, summarizer);
}

function createConfiguration(): ResolvedRecapConfiguration {
	return {
		id: 1,
		guildId: 1,
		sourceChannelId: 1,
		destinationChannelId: 2,
		time: '21:00',
		timezone: 'America/New_York',
		lastSuccessfulRecapAt: new Date('2026-06-29T01:00:00.000Z'),
		lastSuccessfulLocalDate: '2026-06-28',
		claimExpiresAt: null,
		discordGuildId: 'guild-1',
		discordSourceChannelId: 'source-1',
		discordDestinationChannelId: 'destination-1',
	};
}
