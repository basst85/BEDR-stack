import { Elysia } from 'elysia';

import { imageErrorDto, imageOptimizationQuery } from './model';
import { ImageOptimizationError, ImagesService } from './service';

const imagesService = new ImagesService();

export const imagesController = new Elysia({ prefix: '/images' }).get(
  '/optimize',
  async ({ query, set }) => {
    try {
      return await imagesService.optimize(query);
    } catch (error) {
      if (error instanceof ImageOptimizationError) {
        set.status = error.status;

        return {
          message: error.message,
        };
      }

      set.status = 500;

      return {
        message: 'Could not optimize the requested image.',
      };
    }
  },
  {
    query: imageOptimizationQuery,
    response: {
      400: imageErrorDto,
      403: imageErrorDto,
      500: imageErrorDto,
      502: imageErrorDto,
    },
    detail: {
      tags: ['images'],
      summary: 'Optimize a remote image with Bun.Image',
    },
  },
);