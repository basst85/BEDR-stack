import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { t } from 'elysia';

export const unitTypeValues = [
  '420',
  '660',
  '730',
  '733',
  '900',
  'cabine',
] as const;

export const bookingRequestsTable = sqliteTable('booking_requests', {
  id: text('id').primaryKey(),
  requestGroupId: text('request_group_id').notNull(),
  unitType: text('unit_type').notNull(),
  quantity: integer('quantity').notNull(),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  guestPhone: text('guest_phone').notNull(),
  checkIn: text('check_in').notNull(),
  checkOut: text('check_out').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const bookingRequestLinePayload = t.Object({
  unitType: t.String({ minLength: 1 }),
  quantity: t.Integer({ minimum: 1, maximum: 999 }),
});

export const bookingRequestPayload = t.Object({
  lines: t.Array(bookingRequestLinePayload, { minItems: 1, maxItems: unitTypeValues.length }),
  guestName: t.String({ minLength: 2 }),
  guestEmail: t.String({ format: 'email' }),
  guestPhone: t.String({ minLength: 8 }),
  checkIn: t.String({ minLength: 10 }),
  checkOut: t.String({ minLength: 10 }),
  notes: t.Optional(t.String()),
});

export const bookingAvailabilityDto = t.Object({
  unitType: t.String(),
  title: t.String(),
  remaining: t.Integer(),
});

export const bookingConfirmationDto = t.Object({
  id: t.String({ format: 'uuid' }),
  confirmationCode: t.String(),
  lines: t.Array(
    t.Object({
      unitType: t.String(),
      quantity: t.Integer(),
      remaining: t.Integer(),
    }),
  ),
  status: t.Literal('pending'),
});

export const bookingErrorDto = t.Object({
  message: t.String(),
});

export type BookingRequestPayload = typeof bookingRequestPayload.static;
export type UnitTypeValue = (typeof unitTypeValues)[number];