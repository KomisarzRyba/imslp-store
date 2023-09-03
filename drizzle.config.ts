import type { Config } from 'drizzle-kit';

require('dotenv').config();
export default {
	schema: './models/*',
	out: './drizzle',
	driver: 'pg',
	dbCredentials: {
		connectionString: process.env.DATABASE_DIRECT_URL!,
	},
} satisfies Config;
