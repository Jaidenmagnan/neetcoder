import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/db/schema',
    dbCredentials: {
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER!,
        password: process.env.DB_PASS!,
        database: process.env.DB_NAME!,
        ssl: process.env.SSL? false: false,
    }
})