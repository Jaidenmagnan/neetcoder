import { drizzle } from 'drizzle-orm/node-postgres';
import * as guilds from './schema/guilds';
import * as members from './schema/members';
import * as users from './schema/users';

export const db = drizzle(process.env.DB_URL, {
	schema: { ...users, ...guilds, ...members },
});
