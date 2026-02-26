import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { feeds } from '../db/schema/feeds';

export type Feed = InferSelectModel<typeof feeds>;
export type CreateFeed = InferInsertModel<typeof feeds>;

