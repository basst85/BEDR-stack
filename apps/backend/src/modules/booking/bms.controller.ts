import { Elysia, t } from 'elysia';
import { jwtVerify, SignJWT } from 'jose';

import { config } from '@backend/core/config';
import { db } from '@backend/core/db';
import {
  clearBmsSessionCookie,
  createBmsSessionCookie,
  readBmsSessionToken,
} from '@backend/core/session';

import { unitStockTable, unitTypeValues, type UnitTypeValue } from './booking.model';
import { BookingService } from './service';

const bookingService = new BookingService();
const jwtSecret = new TextEncoder().encode(config.jwtSecret);

async function verifyBmsSession(cookieHeader?: string | null): Promise<boolean> {
  const token = readBmsSessionToken(cookieHeader);
  if (!token) return false;
  try {
    const verified = await jwtVerify(token, jwtSecret);
    return (
      verified.payload.role === 'bms_admin' &&
      verified.payload.sub === config.bmsUser
    );
  } catch {
    return false;
  }
}

export const bmsController = new Elysia({ prefix: '/bms' })
  .post(
    '/login',
    async ({ body, set }) => {
      const { username, password } = body;

      if (username === config.bmsUser && password === config.bmsPassword) {
        const token = await new SignJWT({ role: 'bms_admin' })
          .setProtectedHeader({ alg: 'HS256' })
          .setSubject(username)
          .setIssuedAt()
          .setExpirationTime('7d')
          .sign(jwtSecret);

        set.headers['set-cookie'] = createBmsSessionCookie(token);

        return {
          authenticated: true,
          user: username,
        };
      }

      set.status = 401;
      return {
        message: 'Ongeldige gebruikersnaam of wachtwoord.',
      };
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
      response: {
        200: t.Object({
          authenticated: t.Literal(true),
          user: t.String(),
        }),
        401: t.Object({
          message: t.String(),
        }),
      },
      detail: {
        tags: ['bms'],
        summary: 'Log in as BMS administrator',
      },
    },
  )
  .post(
    '/logout',
    ({ set }) => {
      set.headers['set-cookie'] = clearBmsSessionCookie();
      return {
        authenticated: false,
      };
    },
    {
      response: {
        200: t.Object({
          authenticated: t.Literal(false),
        }),
      },
      detail: {
        tags: ['bms'],
        summary: 'Log out BMS session',
      },
    },
  )
  .get(
    '/me',
    async ({ request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          authenticated: false,
        };
      }

      return {
        authenticated: true,
        user: config.bmsUser,
      };
    },
    {
      response: {
        200: t.Object({
          authenticated: t.Literal(true),
          user: t.String(),
        }),
        401: t.Object({
          authenticated: t.Literal(false),
        }),
      },
      detail: {
        tags: ['bms'],
        summary: 'Get current BMS session status',
      },
    },
  )
  .get(
    '/bookings',
    async ({ request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      const bookings = await bookingService.getAllBookings();
      return bookings;
    },
    {
      detail: {
        tags: ['bms'],
        summary: 'Retrieve all bookings',
      },
    },
  )
  .delete(
    '/bookings/:requestGroupId/permanent',
    async ({ params, request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      try {
        await bookingService.deleteBookingGroup(params.requestGroupId);
        return {
          success: true,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Kon boeking niet definitief verwijderen.';
        set.status =
          message === 'Boeking niet gevonden.'
            ? 404
            : message === 'Alleen geannuleerde boekingen kunnen definitief verwijderd worden.'
              ? 400
              : 500;

        return { message };
      }
    },
    {
      params: t.Object({
        requestGroupId: t.String({ minLength: 1 }),
      }),
      response: {
        200: t.Object({
          success: t.Literal(true),
        }),
        400: t.Object({
          message: t.String(),
        }),
        401: t.Object({
          message: t.String(),
        }),
        404: t.Object({
          message: t.String(),
        }),
        500: t.Object({
          message: t.String(),
        }),
      },
      detail: {
        tags: ['bms'],
        summary: 'Permanently delete a cancelled booking group',
      },
    },
  )
  .delete(
    '/bookings/:requestGroupId',
    async ({ params, request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      try {
        await bookingService.cancelBookingGroup(params.requestGroupId);
        return {
          success: true,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Kon boeking niet verwijderen.';
        set.status = message === 'Boeking niet gevonden.' ? 404 : 500;

        return { message };
      }
    },
    {
      params: t.Object({
        requestGroupId: t.String({ minLength: 1 }),
      }),
      response: {
        200: t.Object({
          success: t.Literal(true),
        }),
        401: t.Object({
          message: t.String(),
        }),
        404: t.Object({
          message: t.String(),
        }),
        500: t.Object({
          message: t.String(),
        }),
      },
      detail: {
        tags: ['bms'],
        summary: 'Cancel all booking lines for a booking group',
      },
    },
  )
  .post(
    '/bookings/:requestGroupId/approve',
    async ({ params, request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      try {
        await bookingService.approveBookingGroup(params.requestGroupId);
        return {
          success: true,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Kon boeking niet accorderen.';
        set.status = message === 'Boeking niet gevonden.' ? 404 : 500;

        return { message };
      }
    },
    {
      params: t.Object({
        requestGroupId: t.String({ minLength: 1 }),
      }),
      response: {
        200: t.Object({
          success: t.Literal(true),
        }),
        401: t.Object({
          message: t.String(),
        }),
        404: t.Object({
          message: t.String(),
        }),
        500: t.Object({
          message: t.String(),
        }),
      },
      detail: {
        tags: ['bms'],
        summary: 'Approve all booking lines for a booking group',
      },
    },
  )
  .get(
    '/stocks',
    async ({ request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      const availability = await bookingService.getAvailability();
      const stockOverrides = await db.select().from(unitStockTable);
      const overridesMap = new Map(stockOverrides.map((row) => [row.unitType, row.stock]));

      return availability.map((item) => {
        const customStock = overridesMap.get(item.unitType);
        const defaultStock = config.bookingStockByUnitType[item.unitType as UnitTypeValue];
        const totalStock = customStock ?? defaultStock;
        const reserved = totalStock - item.remaining;

        return {
          unitType: item.unitType,
          title: item.title,
          defaultStock,
          customStock: customStock ?? null,
          totalStock,
          reserved: Math.max(reserved, 0),
          remaining: item.remaining,
          isOverridden: customStock !== undefined,
        };
      });
    },
    {
      detail: {
        tags: ['bms'],
        summary: 'Retrieve all unit stocks and occupancy details',
      },
    },
  )
  .post(
    '/stocks',
    async ({ body, request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      const { unitType, stock } = body;

      if (!unitTypeValues.includes(unitType as UnitTypeValue)) {
        set.status = 400;
        return {
          message: 'Ongeldige unit type.',
        };
      }

      try {
        await bookingService.updateStock(unitType as UnitTypeValue, stock);
        return {
          success: true,
        };
      } catch (error) {
        set.status = 500;
        return {
          message: error instanceof Error ? error.message : 'Kon voorraad niet bijwerken.',
        };
      }
    },
    {
      body: t.Object({
        unitType: t.String(),
        stock: t.Integer({ minimum: 0, maximum: 9999 }),
      }),
      response: {
        200: t.Object({
          success: t.Literal(true),
        }),
        400: t.Object({
          message: t.String(),
        }),
        401: t.Object({
          message: t.String(),
        }),
        500: t.Object({
          message: t.String(),
        }),
      },
      detail: {
        tags: ['bms'],
        summary: 'Set total stock for a unit type',
      },
    },
  );
