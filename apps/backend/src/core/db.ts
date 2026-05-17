import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';

import { config } from './config';

const sqlite = new Database(config.databaseUrl);

export const db = drizzle(sqlite);
export { sqlite };
