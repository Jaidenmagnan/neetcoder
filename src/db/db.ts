import { drizzle } from 'drizzle-orm/singlestore/driver';

const db = drizzle({ connection: process.env.DATABASE_URL, casing: 'snake_case' })