import { eq } from 'drizzle-orm';
import { jwtVerify, SignJWT } from 'jose';

import { config } from '@backend/core/config';
import { db } from '@backend/core/db';
import { usersTable } from '@backend/modules/users/model';

import type { LoginPayload, SessionResponse } from './model';

const jwtSecret = new TextEncoder().encode(config.jwtSecret);

export class AuthService {
  async login(payload: LoginPayload): Promise<SessionResponse & { token: string }> {
    const user = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        passwordHash: usersTable.passwordHash,
      })
      .from(usersTable)
      .where(eq(usersTable.email, payload.email))
      .get();

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isValidPassword = await Bun.password.verify(payload.password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid email or password.');
    }

    const token = await new SignJWT({
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(jwtSecret);

    return {
      authenticated: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async getSession(token: string): Promise<SessionResponse> {
    const verified = await jwtVerify(token, jwtSecret);
    const userId = verified.payload.sub;

    if (!userId) {
      throw new Error('Invalid session token.');
    }

    const user = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .get();

    if (!user) {
      throw new Error('Session user no longer exists.');
    }

    return {
      authenticated: true,
      user,
    };
  }
}
