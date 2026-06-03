import { Elysia, t } from 'elysia';

import {
  bookingAvailabilityDto,
  bookingConfirmationDto,
  bookingErrorDto,
  bookingRequestPayload,
} from './booking.model';
import { BookingInventoryError, BookingService } from './service';

const bookingService = new BookingService();

export const bookingController = new Elysia({ prefix: '/bookings' })
  .get(
    '/availability',
    async () => bookingService.getAvailability(),
    {
      response: {
        200: t.Array(bookingAvailabilityDto),
      },
      detail: {
        tags: ['bookings'],
        summary: 'List booking availability by unit type',
      },
    },
  )
  .post(
    '/',
    async ({ body, set }) => {
      try {
        return await bookingService.create(body);
      } catch (error) {
        if (error instanceof BookingInventoryError) {
          set.status = 409;

          return {
            message: error.message,
          };
        }

        set.status = 500;

        return {
          message: 'Could not store the booking request.',
        };
      }
    },
    {
      body: bookingRequestPayload,
      response: {
        200: bookingConfirmationDto,
        409: bookingErrorDto,
        500: bookingErrorDto,
      },
      detail: {
        tags: ['bookings'],
        summary: 'Create a booking request with stock checks',
      },
    },
  );