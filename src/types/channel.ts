import type { InferSelectModel } from 'drizzle-orm';
import type { channels } from '../db/schema/channels';

export type Channel = InferSelectModel<typeof channels>;
