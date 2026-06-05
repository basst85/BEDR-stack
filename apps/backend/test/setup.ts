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
process.env.IMAGE_ALLOWED_HOSTS = 'images.unsplash.com';
process.env.BOOKING_STOCK_420 = '2';
process.env.BOOKING_STOCK_660 = '4';
process.env.BOOKING_STOCK_730 = '3';
process.env.BOOKING_STOCK_733 = '2';
process.env.BOOKING_STOCK_900 = '1';
process.env.BOOKING_STOCK_CABINE = '8';

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

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS booking_requests (
    id TEXT PRIMARY KEY NOT NULL,
    request_group_id TEXT NOT NULL,
    confirmation_code TEXT,
    unit_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL
  );
`);

try {
  sqlite.exec(`ALTER TABLE booking_requests ADD COLUMN confirmation_code TEXT;`);
} catch {
  // Column already exists in reused local test databases.
}

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS unit_stock (
    unit_type TEXT PRIMARY KEY NOT NULL,
    stock INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

beforeEach(() => {
  sqlite.exec('DELETE FROM users;');
  sqlite.exec('DELETE FROM booking_requests;');
  sqlite.exec('DELETE FROM unit_stock;');
});

afterAll(() => {
  sqlite.close();
  rmSync(testDatabasePath, { force: true });
});
