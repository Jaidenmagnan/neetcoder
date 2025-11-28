import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/db/schema',
    dbCredentials: {
        url: process.env.DB_URL || '',
    }
})