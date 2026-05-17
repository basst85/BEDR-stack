import { t } from 'elysia';

export const loginPayload = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8 }),
});

export const authUserDto = t.Object({
  id: t.String({ format: 'uuid' }),
  email: t.String(),
  name: t.String(),
});

export const sessionResponse = t.Object({
  authenticated: t.Literal(true),
  user: authUserDto,
});

export const authErrorResponse = t.Object({
  message: t.String(),
});

export const logoutResponse = t.Object({
  authenticated: t.Literal(false),
});

export type LoginPayload = typeof loginPayload.static;
export type SessionResponse = typeof sessionResponse.static;
