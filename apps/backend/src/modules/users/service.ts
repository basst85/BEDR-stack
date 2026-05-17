import { desc, eq } from 'drizzle-orm';

import { db } from '@backend/core/db';

import { usersTable, type CreateUserPayload } from './model';

export class UsersService {
  async list() {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    }));
  }

  async create(payload: CreateUserPayload) {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, payload.email))
      .get();

    if (existing) {
      throw new Error('A user with this email already exists.');
    }

    const passwordHash = await Bun.password.hash(payload.password);

    const inserted = await db
      .insert(usersTable)
      .values({
        id: crypto.randomUUID(),
        email: payload.email,
        name: payload.name,
        passwordHash,
      })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        createdAt: usersTable.createdAt,
      })
      .get();

    return {
      id: inserted.id,
      email: inserted.email,
      name: inserted.name,
      createdAt: inserted.createdAt.toISOString(),
    };
  }
}
