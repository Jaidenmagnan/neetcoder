import type { InferSelectModel } from 'drizzle-orm';
import type { guilds } from '../db/schema/guilds';

export type Guild = InferSelectModel<typeof guilds>;
