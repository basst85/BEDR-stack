import { Elysia, t } from 'elysia';
import { jwtVerify, SignJWT } from 'jose';

import { config } from '@backend/core/config';
import { db } from '@backend/core/db';
import {
  clearBmsSessionCookie,
  createBmsSessionCookie,
  readBmsSessionToken,
} from '@backend/core/session';

import { locationUpdatePayload } from '@backend/modules/locations/locations.model';
import { LocationsService } from '@backend/modules/locations/service';

import { unitPriceTable, unitStockTable, unitTypeValues, type UnitTypeValue } from './booking.model';
import { BookingService } from './service';

const bookingService = new BookingService();
const locationsService = new LocationsService();
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
  .get(
    '/booking-emails',
    async ({ request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      const emailLogs = await bookingService.getAllBookingEmailLogs();
      return emailLogs;
    },
    {
      detail: {
        tags: ['bms'],
        summary: 'Retrieve all booking email logs',
      },
    },
  )
  .get(
    '/received-emails',
    async ({ request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      try {
        const receivedEmails = await bookingService.getAllReceivedEmails();
        return receivedEmails;
      } catch (error) {
        set.status = 502;
        return {
          message: error instanceof Error ? error.message : 'Kon ontvangen e-mails niet ophalen via Resend.',
        };
      }
    },
    {
      detail: {
        tags: ['bms'],
        summary: 'Retrieve received emails from Resend',
      },
    },
  )
  .post(
    '/received-emails/:emailId/respond',
    async ({ params, body, request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      try {
        return await bookingService.respondToReceivedEmail({
          emailId: params.emailId,
          action: body.action,
          to: body.to,
          subject: body.subject,
          textBody: body.textBody,
        });
      } catch (error) {
        set.status = 502;
        return {
          message: error instanceof Error ? error.message : 'Kon e-mailactie niet uitvoeren via Resend.',
        };
      }
    },
    {
      params: t.Object({
        emailId: t.String({ minLength: 1 }),
      }),
      body: t.Object({
        action: t.Union([t.Literal('reply'), t.Literal('forward')]),
        to: t.Array(t.String({ format: 'email' }), { minItems: 1 }),
        subject: t.String({ minLength: 1 }),
        textBody: t.String({ minLength: 1 }),
      }),
      detail: {
        tags: ['bms'],
        summary: 'Reply to or forward a received email via Resend',
      },
    },
  )
  .post(
    '/received-emails/:emailId/archive',
    async ({ params, request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      try {
        return await bookingService.archiveReceivedEmail(params.emailId);
      } catch (error) {
        set.status = 500;
        return {
          message: error instanceof Error ? error.message : 'Kon ontvangen e-mail niet archiveren.',
        };
      }
    },
    {
      params: t.Object({
        emailId: t.String({ minLength: 1 }),
      }),
      detail: {
        tags: ['bms'],
        summary: 'Archive a received email locally in the BMS',
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
  )
  .get(
    '/prices',
    async ({ request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      const availability = await bookingService.getAvailability();
      const priceOverrides = await db.select().from(unitPriceTable);
      const overridesMap = new Map(priceOverrides.map((row) => [row.unitType, row.pricePerNight]));

      return availability.map((item) => {
        const customPrice = overridesMap.get(item.unitType);
        const defaultPrice = config.bookingPriceByUnitType[item.unitType as UnitTypeValue];

        return {
          unitType: item.unitType,
          title: item.title,
          defaultPrice,
          customPrice: customPrice ?? null,
          price: customPrice ?? defaultPrice,
          isOverridden: customPrice !== undefined,
        };
      });
    },
    {
      detail: {
        tags: ['bms'],
        summary: 'Retrieve all unit prices',
      },
    },
  )
  .post(
    '/prices',
    async ({ body, request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      const { unitType, price } = body;

      if (!unitTypeValues.includes(unitType as UnitTypeValue)) {
        set.status = 400;
        return {
          message: 'Ongeldige unit type.',
        };
      }

      try {
        await bookingService.updatePrice(unitType as UnitTypeValue, price);
        return {
          success: true,
        };
      } catch (error) {
        set.status = 500;
        return {
          message: error instanceof Error ? error.message : 'Kon prijs niet bijwerken.',
        };
      }
    },
    {
      body: t.Object({
        unitType: t.String(),
        price: t.Integer({ minimum: 0, maximum: 99999 }),
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
        summary: 'Set price per night for a unit type',
      },
    },
  )
  .get(
    '/locations',
    async ({ request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      return locationsService.getAll();
    },
    {
      detail: {
        tags: ['bms'],
        summary: 'Retrieve all campsite locations',
      },
    },
  )
  .post(
    '/locations/:id',
    async ({ params, body, request, set }) => {
      const isValid = await verifyBmsSession(request.headers.get('cookie'));

      if (!isValid) {
        set.status = 401;
        return {
          message: 'Niet geautoriseerd.',
        };
      }

      try {
        await locationsService.update(params.id, body);
        return {
          success: true,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Kon locatie niet bijwerken.';
        set.status = message === 'Locatie niet gevonden.' ? 404 : 500;

        return { message };
      }
    },
    {
      params: t.Object({
        id: t.String({ minLength: 1 }),
      }),
      body: locationUpdatePayload,
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
        summary: 'Update name and address for a campsite location',
      },
    },
  );
