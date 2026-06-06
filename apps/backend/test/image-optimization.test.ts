import { afterEach, describe, expect, mock, test } from 'bun:test';

import { app } from '@backend/server';

type ErrorResponse = {
  message: string;
};

const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+tmqQAAAAASUVORK5CYII=',
  'base64',
);

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  mock.restore();
});

describe('image optimization route', () => {
  test('optimizes images from allowed hosts', async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      expect(String(input)).toBe('https://images.unsplash.com/demo-image.png');

      return new Response(tinyPng, {
        headers: {
          'content-type': 'image/png',
        },
      });
    }) as unknown as typeof fetch;

    const response = await app.handle(
      new Request(
        'http://localhost/api/images/optimize?src=https%3A%2F%2Fimages.unsplash.com%2Fdemo-image.png&width=640&format=webp&quality=75',
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/webp');
    expect(response.headers.get('cache-control')).toContain('max-age=3600');

    const bytes = await response.arrayBuffer();

    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('rejects images from disallowed hosts', async () => {
    const response = await app.handle(
      new Request(
        'http://localhost/api/images/optimize?src=https%3A%2F%2Fevil.example%2Fdemo-image.png&width=640&format=webp',
      ),
    );

    const payload = (await response.json()) as ErrorResponse;

    expect(response.status).toBe(403);
    expect(payload).toEqual({ message: 'This image host is not allowed.' });
  });
});
