import { desc, eq, ne, sql } from 'drizzle-orm';

import { config } from '@backend/core/config';
import { db } from '@backend/core/db';

import { locationsTable } from '@backend/modules/locations/locations.model';

import {
  archivedReceivedEmailsTable,
  bookingEmailLogsTable,
  bookingRequestsTable,
  unitPriceTable,
  unitStockTable,
  type BookingRequestPayload,
  type UnitTypeValue,
  unitTypeValues,
} from './booking.model';
import { listResendReceivedEmails, listResendSentEmails, respondToReceivedEmail, sendBookingConfirmationEmail } from './email.service';

const unitCatalog: Record<UnitTypeValue, { title: string }> = {
  '420': { title: '2 persoons unit met stapelbed' },
  '660': { title: '2 persoons unit met 2 losse bedden' },
  '730': { title: '4 persoons unit met twee stapelbedden' },
  '733': { title: '4 persoons unit met stapelbed en twee persoonsbed' },
  '900': { title: '3 - 5 persoons VIP unit' },
  cabine: { title: '2 persoons compartiment in 8 persoons slaapwagen' },
};

const validUnitTypes = new Set<UnitTypeValue>(unitTypeValues);
const confirmationCodeMin = 100000;
const confirmationCodeMax = 999999;

export class BookingInventoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingInventoryError';
  }
}

export class BookingService {
  private async generateConfirmationCode() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidate = String(
        crypto.getRandomValues(new Uint32Array(1))[0] % (confirmationCodeMax - confirmationCodeMin + 1) +
          confirmationCodeMin,
      );

      const existing = await db
        .select({ confirmationCode: bookingRequestsTable.confirmationCode })
        .from(bookingRequestsTable)
        .where(eq(bookingRequestsTable.confirmationCode, candidate))
        .get();

      if (!existing) {
        return candidate;
      }
    }

    throw new Error('Kon geen unieke boekingscode genereren.');
  }

  async getAvailability() {
    const reservations = await db
      .select({
        unitType: bookingRequestsTable.unitType,
        reserved: sql<number>`coalesce(sum(${bookingRequestsTable.quantity}), 0)`,
      })
      .from(bookingRequestsTable)
      .where(ne(bookingRequestsTable.status, 'cancelled'))
      .groupBy(bookingRequestsTable.unitType);

    const reservedMap = new Map(reservations.map((item) => [item.unitType, Number(item.reserved)]));

    const stockOverrides = await db.select().from(unitStockTable);
    const stockOverridesMap = new Map(stockOverrides.map((row) => [row.unitType, row.stock]));

    const priceOverrides = await db.select().from(unitPriceTable);
    const priceOverridesMap = new Map(priceOverrides.map((row) => [row.unitType, row.pricePerNight]));

    return unitTypeValues.map((unitType) => {
      const reserved = reservedMap.get(unitType) ?? 0;
      const stockLimit = stockOverridesMap.get(unitType) ?? config.bookingStockByUnitType[unitType];
      const pricePerNight = priceOverridesMap.get(unitType) ?? config.bookingPriceByUnitType[unitType];

      return {
        unitType,
        title: unitCatalog[unitType].title,
        remaining: Math.max(stockLimit - reserved, 0),
        pricePerNight,
      };
    });
  }

  async create(payload: BookingRequestPayload) {
    const location = await db
      .select({ id: locationsTable.id, name: locationsTable.name })
      .from(locationsTable)
      .where(eq(locationsTable.id, payload.locationId))
      .get();

    if (!location) {
      throw new BookingInventoryError('Unknown location selected.');
    }

    const groupedLines = new Map<UnitTypeValue, number>();

    for (const line of payload.lines) {
      if (!validUnitTypes.has(line.unitType as UnitTypeValue)) {
        throw new BookingInventoryError('Unknown unit type selected.');
      }

      const unitType = line.unitType as UnitTypeValue;
      groupedLines.set(unitType, (groupedLines.get(unitType) ?? 0) + line.quantity);
    }

    const availability = await this.getAvailability();
    const availabilityByUnitType = new Map(availability.map((item) => [item.unitType as UnitTypeValue, item]));

    for (const [unitType, quantity] of groupedLines) {
      const lineAvailability = availabilityByUnitType.get(unitType);

      if (!lineAvailability) {
        throw new BookingInventoryError('Unknown unit type selected.');
      }

      if (quantity > lineAvailability.remaining) {
        throw new BookingInventoryError(
          lineAvailability.remaining > 0
            ? `Only ${lineAvailability.remaining} unit(s) remain for this type.`
            : 'This unit type is fully booked.',
        );
      }
    }

    const requestGroupId = crypto.randomUUID();
    const confirmationCode = await this.generateConfirmationCode();
    const groupedBookingLines = Array.from(groupedLines.entries()).map(([unitType, quantity]) => ({
      unitType,
      quantity,
    }));

    await db.insert(bookingRequestsTable).values(
      groupedBookingLines.map(({ unitType, quantity }) => ({
        id: crypto.randomUUID(),
        requestGroupId,
        confirmationCode,
        locationId: payload.locationId,
        unitType,
        quantity,
        guestName: payload.guestName,
        guestEmail: payload.guestEmail,
        guestPhone: payload.guestPhone,
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        notes: payload.notes,
        status: 'pending',
      })),
    );

    const unitPrices = Object.fromEntries(
      availability.map((item) => [item.unitType, item.pricePerNight]),
    ) as Record<UnitTypeValue, number>;

    const emailLog = await sendBookingConfirmationEmail({
      requestGroupId,
      confirmationCode,
      locationName: location.name,
      guestName: payload.guestName,
      guestEmail: payload.guestEmail,
      guestPhone: payload.guestPhone,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      notes: payload.notes,
      lines: groupedBookingLines,
      unitPrices,
    });

    await db.insert(bookingEmailLogsTable).values({
      id: crypto.randomUUID(),
      requestGroupId,
      emailType: emailLog.emailType,
      provider: emailLog.provider,
      providerMessageId: emailLog.providerMessageId,
      status: emailLog.status,
      recipientEmail: emailLog.recipientEmail,
      subject: emailLog.subject,
      htmlBody: emailLog.htmlBody,
      textBody: emailLog.textBody,
      errorMessage: emailLog.errorMessage,
    });

    return {
      id: requestGroupId,
      confirmationCode,
      lines: groupedBookingLines.map(({ unitType, quantity }) => ({
        unitType,
        quantity,
        remaining: (availabilityByUnitType.get(unitType)?.remaining ?? 0) - quantity,
      })),
      status: 'pending' as const,
    };
  }

  async updateStock(unitType: UnitTypeValue, stock: number) {
    if (!validUnitTypes.has(unitType)) {
      throw new Error('Unknown unit type selected.');
    }

    await db
      .insert(unitStockTable)
      .values({
        unitType,
        stock,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: unitStockTable.unitType,
        set: {
          stock,
          updatedAt: new Date(),
        },
      });
  }

  async updatePrice(unitType: UnitTypeValue, pricePerNight: number) {
    if (!validUnitTypes.has(unitType)) {
      throw new Error('Unknown unit type selected.');
    }

    await db
      .insert(unitPriceTable)
      .values({
        unitType,
        pricePerNight,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: unitPriceTable.unitType,
        set: {
          pricePerNight,
          updatedAt: new Date(),
        },
      });
  }

  async getAllBookings() {
    return db
      .select()
      .from(bookingRequestsTable)
      .orderBy(desc(bookingRequestsTable.createdAt));
  }

  async getAllBookingEmailLogs() {
    const logs = await db
      .select()
      .from(bookingEmailLogsTable)
      .orderBy(desc(bookingEmailLogsTable.createdAt));

    const resendEmails = await listResendSentEmails();
    const resendEmailsById = new Map(resendEmails.map((email) => [email.id, email]));

    return logs.map((log) => {
      const resendEmail = log.providerMessageId ? resendEmailsById.get(log.providerMessageId) : undefined;

      return {
        ...log,
        providerLastEvent: resendEmail?.lastEvent ?? null,
        providerCreatedAt: resendEmail?.createdAt ?? null,
        providerFrom: resendEmail?.from ?? null,
        providerTo: resendEmail?.to ?? null,
        providerSubject: resendEmail?.subject ?? null,
      };
    });
  }

  async getAllReceivedEmails() {
    const archivedEmails = await db.select().from(archivedReceivedEmailsTable);
    const archivedEmailIds = new Set(archivedEmails.map((item) => item.emailId));
    const receivedEmails = await listResendReceivedEmails();

    return receivedEmails.filter((email) => !archivedEmailIds.has(email.id));
  }

  async respondToReceivedEmail(params: {
    emailId: string;
    action: 'reply' | 'forward';
    to: string[];
    subject: string;
    textBody: string;
  }) {
    return respondToReceivedEmail(params);
  }

  async archiveReceivedEmail(emailId: string) {
    await db
      .insert(archivedReceivedEmailsTable)
      .values({
        emailId,
        archivedAt: new Date(),
      })
      .onConflictDoNothing();

    return { success: true as const };
  }

  async cancelBookingGroup(requestGroupId: string) {
    const existingBooking = await db
      .select({ requestGroupId: bookingRequestsTable.requestGroupId })
      .from(bookingRequestsTable)
      .where(eq(bookingRequestsTable.requestGroupId, requestGroupId))
      .get();

    if (!existingBooking) {
      throw new Error('Boeking niet gevonden.');
    }

    await db
      .update(bookingRequestsTable)
      .set({ status: 'cancelled' })
      .where(eq(bookingRequestsTable.requestGroupId, requestGroupId));
  }

  async approveBookingGroup(requestGroupId: string) {
    const existingBooking = await db
      .select({ requestGroupId: bookingRequestsTable.requestGroupId })
      .from(bookingRequestsTable)
      .where(eq(bookingRequestsTable.requestGroupId, requestGroupId))
      .get();

    if (!existingBooking) {
      throw new Error('Boeking niet gevonden.');
    }

    await db
      .update(bookingRequestsTable)
      .set({ status: 'approved' })
      .where(eq(bookingRequestsTable.requestGroupId, requestGroupId));
  }

  async deleteBookingGroup(requestGroupId: string) {
    const existingBooking = await db
      .select({
        requestGroupId: bookingRequestsTable.requestGroupId,
        status: bookingRequestsTable.status,
      })
      .from(bookingRequestsTable)
      .where(eq(bookingRequestsTable.requestGroupId, requestGroupId))
      .get();

    if (!existingBooking) {
      throw new Error('Boeking niet gevonden.');
    }

    if (existingBooking.status !== 'cancelled') {
      throw new Error('Alleen geannuleerde boekingen kunnen definitief verwijderd worden.');
    }

    await db
      .delete(bookingEmailLogsTable)
      .where(eq(bookingEmailLogsTable.requestGroupId, requestGroupId));

    await db
      .delete(bookingRequestsTable)
      .where(eq(bookingRequestsTable.requestGroupId, requestGroupId));
  }
}
