import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { t } from 'elysia';

export const locationsTable = sqliteTable('locations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const locationDto = t.Object({
  id: t.String(),
  name: t.String(),
  address: t.String(),
});

export const locationUpdatePayload = t.Object({
  name: t.String({ minLength: 1 }),
  address: t.String({ minLength: 1 }),
});
