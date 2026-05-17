import { afterAll, beforeEach } from 'bun:test';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';

const tempDirectory = join(import.meta.dir, '.tmp');
const testDatabasePath = join(tempDirectory, 'backend.test.sqlite');

mkdirSync(dirname(testDatabasePath), { recursive: true });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = testDatabasePath;
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.COOKIE_NAME = 'bedr_test_session';

const { sqlite } = await import('@backend/core/db');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

beforeEach(() => {
  sqlite.exec('DELETE FROM users;');
});

afterAll(() => {
  sqlite.close();
  rmSync(testDatabasePath, { force: true });
});
