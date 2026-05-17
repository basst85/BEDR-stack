import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { t } from 'elysia';

export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const createUserPayload = t.Object({
  email: t.String({ format: 'email' }),
  name: t.String({ minLength: 2 }),
  password: t.String({ minLength: 8 }),
});

export const userDto = t.Object({
  id: t.String({ format: 'uuid' }),
  email: t.String(),
  name: t.String(),
  createdAt: t.String(),
});

export type CreateUserPayload = typeof createUserPayload.static;
