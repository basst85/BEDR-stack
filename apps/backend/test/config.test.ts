import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';

const configPath = resolve(import.meta.dir, '../src/core/config.ts');

describe('config security', () => {
  test('fails fast in production when JWT_SECRET is unset or uses the insecure placeholder', () => {
    const result = Bun.spawnSync({
      cmd: ['bun', configPath],
      cwd: resolve(import.meta.dir, '..'),
      env: {
        ...process.env,
        NODE_ENV: 'production',
        JWT_SECRET: 'change-me-in-production',
      },
      stderr: 'pipe',
      stdout: 'pipe',
    });

    const stderr = result.stderr.toString();

    expect(result.exitCode).not.toBe(0);
    expect(stderr).toContain('JWT_SECRET must be set to a strong, unique value in production.');
  });

  test('defaults CORS origins to the local frontend dev and preview hosts', async () => {
    const previousCorsOrigin = process.env.CORS_ORIGIN;

    delete process.env.CORS_ORIGIN;

    const { config, isAllowedCorsOrigin } = await import(
      `../src/core/config.ts?cors-defaults=${Date.now()}`
    );

    expect(config.corsOrigins).toEqual(['http://localhost:5173']);
    expect(isAllowedCorsOrigin('http://localhost:5173')).toBe(true);
    expect(isAllowedCorsOrigin('http://localhost:4173')).toBe(true);
    expect(isAllowedCorsOrigin('http://127.0.0.1:5173')).toBe(true);
    expect(isAllowedCorsOrigin('http://127.0.0.1:4173')).toBe(true);
    expect(isAllowedCorsOrigin('http://localhost:9999')).toBe(true);
    expect(isAllowedCorsOrigin('http://127.0.0.1:9999')).toBe(true);
    expect(isAllowedCorsOrigin('http://example.com')).toBe(false);

    if (previousCorsOrigin === undefined) {
      delete process.env.CORS_ORIGIN;
      return;
    }

    process.env.CORS_ORIGIN = previousCorsOrigin;
  });

  test('reads booking stock limits per unit type from environment variables', async () => {
    const previous420 = process.env.BOOKING_STOCK_420;
    const previousCabine = process.env.BOOKING_STOCK_CABINE;

    process.env.BOOKING_STOCK_420 = '12';
    process.env.BOOKING_STOCK_CABINE = '7';

    const { config } = await import(`../src/core/config.ts?booking-stock=${Date.now()}`);

    expect(config.bookingStockByUnitType['420']).toBe(12);
    expect(config.bookingStockByUnitType.cabine).toBe(7);

    if (previous420 === undefined) {
      delete process.env.BOOKING_STOCK_420;
    } else {
      process.env.BOOKING_STOCK_420 = previous420;
    }

    if (previousCabine === undefined) {
      delete process.env.BOOKING_STOCK_CABINE;
      return;
    }

    process.env.BOOKING_STOCK_CABINE = previousCabine;
  });
});
