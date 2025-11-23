import { drizzle } from 'drizzle-orm/singlestore/driver';

const _db = drizzle({
	connection: process.env.DATABASE_URL,
	casing: 'snake_case',
});
