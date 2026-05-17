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
});
