import { describe, expect, test } from 'bun:test';

import { sqlite } from '@backend/core/db';
import { app } from '@backend/server';

type BookingAvailabilityItem = {
  unitType: string;
  remaining: number;
};

type BookingConfirmation = {
  id: string;
  confirmationCode: string;
  lines: Array<{
    unitType: string;
    quantity: number;
    remaining: number;
  }>;
};

type ErrorResponse = {
  message: string;
};

const createJsonRequest = (path: string, body?: unknown, init?: RequestInit) =>
  new Request(`http://localhost${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

describe('booking routes', () => {
  test('lists availability using the configured stock per unit type', async () => {
    const response = await app.handle(new Request('http://localhost/api/bookings/availability'));
    const payload = (await response.json()) as BookingAvailabilityItem[];

    expect(response.status).toBe(200);
    expect(payload).toHaveLength(6);
    expect(payload).toContainEqual(expect.objectContaining({ unitType: '420', remaining: 2 }));
    expect(payload).toContainEqual(expect.objectContaining({ unitType: 'cabine', remaining: 8 }));
  });

  test('blocks reservations once the configured stock is exhausted', async () => {
    const acceptedResponse = await app.handle(
      createJsonRequest(
        '/api/bookings',
        {
          locationId: 'crossvillage',
          lines: [
            { unitType: '420', quantity: 1 },
            { unitType: '660', quantity: 2 },
          ],
          guestName: 'Ada Lovelace',
          guestEmail: 'ada@example.com',
          guestPhone: '0612345678',
          checkIn: '2026-11-06',
          checkOut: '2026-11-09',
          notes: 'Late arrival',
        },
        { method: 'POST' },
      ),
    );

    const acceptedPayload = (await acceptedResponse.json()) as BookingConfirmation;

    expect(acceptedResponse.status).toBe(200);
    expect(acceptedPayload.confirmationCode).toMatch(/^\d{6}$/);
    expect(acceptedPayload.lines).toContainEqual(expect.objectContaining({ unitType: '420', quantity: 1, remaining: 1 }));
    expect(acceptedPayload.lines).toContainEqual(expect.objectContaining({ unitType: '660', quantity: 2, remaining: 2 }));

    const emailLog = sqlite
      .query(
        'SELECT request_group_id, status, recipient_email, subject, error_message FROM booking_email_logs WHERE request_group_id = ?',
      )
      .get(acceptedPayload.id) as
      | {
          request_group_id: string;
          status: string;
          recipient_email: string;
          subject: string;
          error_message: string | null;
        }
      | null;

    expect(emailLog).not.toBeNull();
    expect(emailLog?.request_group_id).toBe(acceptedPayload.id);
    expect(emailLog?.recipient_email).toBe('ada@example.com');
    expect(['skipped', 'failed', 'sent']).toContain(emailLog?.status ?? '');
    expect(typeof emailLog?.error_message === 'string' || emailLog?.error_message === null).toBe(true);
    expect(emailLog?.subject).toContain(acceptedPayload.confirmationCode);

    const rejectedResponse = await app.handle(
      createJsonRequest(
        '/api/bookings',
        {
          locationId: 'crossvillage',
          lines: [{ unitType: '420', quantity: 2 }],
          guestName: 'Grace Hopper',
          guestEmail: 'grace@example.com',
          guestPhone: '0687654321',
          checkIn: '2026-11-06',
          checkOut: '2026-11-09',
          notes: '',
        },
        { method: 'POST' },
      ),
    );

    const rejectedPayload = (await rejectedResponse.json()) as ErrorResponse;

    expect(rejectedResponse.status).toBe(409);
    expect(rejectedPayload).toEqual({ message: 'Only 1 unit(s) remain for this type.' });
  });
});
