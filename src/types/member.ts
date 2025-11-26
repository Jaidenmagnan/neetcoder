import type { InferSelectModel } from 'drizzle-orm';
import type { members } from '../db/schema/members';

export type Member = InferSelectModel<typeof members>;
