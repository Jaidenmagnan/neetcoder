import type { InferSelectModel } from 'drizzle-orm';
import type { recapConfigurations } from '../db/schema/recaps';

export type RecapConfiguration = InferSelectModel<typeof recapConfigurations>;

export interface ResolvedRecapConfiguration extends RecapConfiguration {
	discordGuildId: string;
	discordSourceChannelId: string;
	discordDestinationChannelId: string;
}

export interface RecapMessage {
	author: string;
	content: string;
	createdAt: Date;
}

export interface RecapContent {
	topDiscussions: string[];
	pointsOfAgreement: string[];
	whereViewsDiffer: string[];
	notableLinks: string[];
}

export interface RecapPreview {
	content: RecapContent;
	messageCount: number;
	truncated: boolean;
	windowStart: Date;
	windowEnd: Date;
}
