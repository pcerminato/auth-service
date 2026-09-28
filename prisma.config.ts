import 'dotenv/config'; // Ensure local .env file loads automatically
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'src/providers/database/prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
