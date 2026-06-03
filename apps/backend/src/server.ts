import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';

import { config, isAllowedCorsOrigin } from './core/config';
import { authController } from './modules/auth/controller';
import { bookingController } from './modules/booking/controller';
import { usersController } from './modules/users/controller';

export const app = new Elysia()
  .use(
    cors({
      origin: (request) => isAllowedCorsOrigin(request.headers.get('origin')),
      methods: ['GET', 'POST'],
      credentials: true,
    }),
  )
  .get('/health', () => ({ status: 'ok' }))
  .group('/api', (api) => api.use(authController).use(usersController).use(bookingController));

export type App = typeof app;

if (import.meta.main) {
  app.listen(config.port);
  console.log(`Backend listening on http://${app.server?.hostname}:${app.server?.port}`);
}
