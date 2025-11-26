import { drizzle } from 'drizzle-orm/node-postgres';
import * as guilds from '../db/schema/guilds';
import * as members from '../db/schema/members';
import * as users from '../db/schema/users';

export const db = drizzle(process.env.DB_URL ?? '', {
	schema: { ...users, ...guilds, ...members },
});
