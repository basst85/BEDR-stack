import { describe, expect, test } from 'bun:test';

import { app } from '@backend/server';

type RegisteredUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
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

describe('auth and protected user routes', () => {
  test('registers a new account through the public auth route', async () => {
    const response = await app.handle(
      createJsonRequest(
        '/api/auth/register',
        {
          email: 'ada@example.com',
          name: 'Ada Lovelace',
          password: 'correct-horse-battery-staple',
        },
        { method: 'POST' },
      ),
    );

    const payload = (await response.json()) as RegisteredUser;

    expect(response.status).toBe(200);
    expect(payload.email).toBe('ada@example.com');
    expect(payload.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  test('rejects listing users when there is no authenticated session', async () => {
    const response = await app.handle(new Request('http://localhost/api/users'));
    const payload = (await response.json()) as ErrorResponse;

    expect(response.status).toBe(401);
    expect(payload).toEqual({ message: 'Authentication required.' });
  });

  test('allows listing users after login with the issued session cookie', async () => {
    await app.handle(
      createJsonRequest(
        '/api/auth/register',
        {
          email: 'grace@example.com',
          name: 'Grace Hopper',
          password: 'correct-horse-battery-staple',
        },
        { method: 'POST' },
      ),
    );

    const loginResponse = await app.handle(
      createJsonRequest(
        '/api/auth/login',
        {
          email: 'grace@example.com',
          password: 'correct-horse-battery-staple',
        },
        { method: 'POST' },
      ),
    );

    const sessionCookie = loginResponse.headers.get('set-cookie');
    expect(loginResponse.status).toBe(200);
    expect(sessionCookie).toContain('bedr_test_session=');

    const usersResponse = await app.handle(
      new Request('http://localhost/api/users', {
        headers: {
          cookie: sessionCookie ?? '',
        },
      }),
    );

    const payload = (await usersResponse.json()) as RegisteredUser[];

    expect(usersResponse.status).toBe(200);
    expect(Array.isArray(payload)).toBe(true);
    expect(payload).toHaveLength(1);
    expect(payload[0]).toMatchObject({
      email: 'grace@example.com',
      name: 'Grace Hopper',
    });
  });
});
