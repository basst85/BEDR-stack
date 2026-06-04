import { describe, expect, test } from 'bun:test';

import { app } from '@backend/server';

type BookingAvailabilityItem = {
  unitType: string;
  stockLimit: number;
  remaining: number;
};

type BookingConfirmation = {
  confirmationCode: string;
  remaining: number;
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
    expect(payload).toContainEqual(expect.objectContaining({ unitType: '420', stockLimit: 2, remaining: 2 }));
    expect(payload).toContainEqual(
      expect.objectContaining({ unitType: 'cabine', stockLimit: 6, remaining: 6 }),
    );
  });

  test('blocks reservations once the configured stock is exhausted', async () => {
    const acceptedResponse = await app.handle(
      createJsonRequest(
        '/api/bookings',
        {
          unitType: '420',
          quantity: 2,
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
    expect(acceptedPayload.confirmationCode).toMatch(/^VV-/);
    expect(acceptedPayload.remaining).toBe(0);

    const rejectedResponse = await app.handle(
      createJsonRequest(
        '/api/bookings',
        {
          unitType: '420',
          quantity: 1,
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
    expect(rejectedPayload).toEqual({ message: 'This unit type is fully booked.' });
  });
});