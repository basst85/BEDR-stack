import { Elysia, t } from 'elysia';

import { authErrorResponse } from '@backend/modules/auth/model';
import { resolveAuthenticatedSession } from '@backend/modules/auth/session';

import { createUserPayload, userDto } from './model';
import { UsersService } from './service';

const usersService = new UsersService();

export const usersController = new Elysia({ prefix: '/users' })
  .get(
    '/',
    async ({ request, set }) => {
      const session = await resolveAuthenticatedSession(request.headers.get('cookie'));

      if (!session) {
        set.status = 401;

        return {
          message: 'Authentication required.',
        };
      }

      return usersService.list();
    },
    {
      response: {
        200: t.Array(userDto),
        401: authErrorResponse,
      },
      detail: {
        tags: ['users'],
        summary: 'List users',
      },
    },
  )
  .post(
    '/',
    async ({ body, request, set }) => {
      const session = await resolveAuthenticatedSession(request.headers.get('cookie'));

      if (!session) {
        set.status = 401;

        return {
          message: 'Authentication required.',
        };
      }

      try {
        return await usersService.create(body);
      } catch (error) {
        set.status = 409;

        return {
          message: error instanceof Error ? error.message : 'Could not create user.',
        };
      }
    },
    {
      body: createUserPayload,
      response: {
        200: userDto,
        401: authErrorResponse,
        409: t.Object({
          message: t.String(),
        }),
      },
      detail: {
        tags: ['users'],
        summary: 'Create user',
      },
    },
  );
