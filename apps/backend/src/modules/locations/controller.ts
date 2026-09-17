import { Elysia, t } from 'elysia';

import { locationDto } from './locations.model';
import { LocationsService } from './service';

const locationsService = new LocationsService();

export const locationsController = new Elysia({ prefix: '/locations' }).get(
  '/',
  async () => locationsService.getAll(),
  {
    response: {
      200: t.Array(locationDto),
    },
    detail: {
      tags: ['locations'],
      summary: 'List all campsite locations',
    },
  },
);
