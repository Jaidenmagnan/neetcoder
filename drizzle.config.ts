import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';

let connectionString = process.env.DATABASE_URL || '';

if (process.env.NODE_ENV === 'production') {
    connectionString += '?sslmode=require';
}

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/db/schema',
    dbCredentials: {
        url: connectionString,
        ssl: true,
    }
})