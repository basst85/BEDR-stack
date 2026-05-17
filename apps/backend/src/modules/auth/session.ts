import { readSessionToken } from '@backend/core/session';

import { AuthService } from './service';

const authService = new AuthService();

export const resolveAuthenticatedSession = async (cookieHeader?: string | null) => {
  const token = readSessionToken(cookieHeader);

  if (!token) {
    return null;
  }

  try {
    return await authService.getSession(token);
  } catch {
    return null;
  }
};
