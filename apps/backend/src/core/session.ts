import { parse, serialize } from 'cookie';

import { config, isProduction } from './config';

const weekInSeconds = 60 * 60 * 24 * 7;

export const readSessionToken = (cookieHeader?: string | null) => {
  if (!cookieHeader) {
    return null;
  }

  return parse(cookieHeader)[config.cookieName] ?? null;
};

export const createSessionCookie = (token: string) =>
  serialize(config.cookieName, token, {
    httpOnly: true,
    maxAge: weekInSeconds,
    path: '/',
    sameSite: 'lax',
    secure: isProduction,
  });

export const clearSessionCookie = () =>
  serialize(config.cookieName, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: isProduction,
  });
