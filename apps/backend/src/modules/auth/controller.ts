import { Elysia } from 'elysia';

import { clearSessionCookie, createSessionCookie, readSessionToken } from '@backend/core/session';
import { createUserPayload, userDto } from '@backend/modules/users/model';
import { UsersService } from '@backend/modules/users/service';

import { authErrorResponse, loginPayload, logoutResponse, sessionResponse } from './model';
import { AuthService } from './service';

const authService = new AuthService();
const usersService = new UsersService();

export const authController = new Elysia({ prefix: '/auth' })
  .post(
    '/register',
    async ({ body, set }) => {
      try {
        return await usersService.create(body);
      } catch (error) {
        set.status = 409;

        return {
          message: error instanceof Error ? error.message : 'Could not register user.',
        };
      }
    },
    {
      body: createUserPayload,
      response: {
        200: userDto,
        409: authErrorResponse,
      },
      detail: {
        tags: ['auth'],
        summary: 'Register a new user account',
      },
    },
  )
  .post(
    '/login',
    async ({ body, set }) => {
      try {
        const session = await authService.login(body);

        set.headers['set-cookie'] = createSessionCookie(session.token);

        return {
          authenticated: session.authenticated,
          user: session.user,
        };
      } catch (error) {
        set.status = 401;

        return {
          message: error instanceof Error ? error.message : 'Could not authenticate user.',
        };
      }
    },
    {
      body: loginPayload,
      response: {
        200: sessionResponse,
        401: authErrorResponse,
      },
      detail: {
        tags: ['auth'],
        summary: 'Login with email and password',
      },
    },
  )
  .get(
    '/me',
    async ({ request, set }) => {
      const token = readSessionToken(request.headers.get('cookie'));

      if (!token) {
        set.status = 401;
        return {
          message: 'No active session.',
        };
      }

      try {
        return await authService.getSession(token);
      } catch (error) {
        set.status = 401;
        set.headers['set-cookie'] = clearSessionCookie();

        return {
          message: error instanceof Error ? error.message : 'Session is invalid.',
        };
      }
    },
    {
      response: {
        200: sessionResponse,
        401: authErrorResponse,
      },
      detail: {
        tags: ['auth'],
        summary: 'Read the current session',
      },
    },
  )
  .post(
    '/logout',
    ({ set }) => {
      set.headers['set-cookie'] = clearSessionCookie();

      return {
        authenticated: false,
      };
    },
    {
      response: logoutResponse,
      detail: {
        tags: ['auth'],
        summary: 'Clear the current session cookie',
      },
    },
  );
