import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/modules/**/*.model.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? './dev.db',
  },
  verbose: true,
  strict: true,
});
