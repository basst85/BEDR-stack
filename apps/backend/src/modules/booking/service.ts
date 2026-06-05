import { desc, eq, ne, sql } from 'drizzle-orm';

import { config } from '@backend/core/config';
import { db } from '@backend/core/db';

import {
  bookingRequestsTable,
  unitStockTable,
  type BookingRequestPayload,
  type UnitTypeValue,
  unitTypeValues,
} from './booking.model';

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

    return unitTypeValues.map((unitType) => {
      const reserved = reservedMap.get(unitType) ?? 0;
      const stockLimit = stockOverridesMap.get(unitType) ?? config.bookingStockByUnitType[unitType];

      return {
        unitType,
        title: unitCatalog[unitType].title,
        remaining: Math.max(stockLimit - reserved, 0),
      };
    });
  }

  async create(payload: BookingRequestPayload) {
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

    await db.insert(bookingRequestsTable).values(
      Array.from(groupedLines.entries()).map(([unitType, quantity]) => ({
        id: crypto.randomUUID(),
        requestGroupId,
        confirmationCode,
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

    return {
      id: requestGroupId,
      confirmationCode,
      lines: Array.from(groupedLines.entries()).map(([unitType, quantity]) => ({
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

  async getAllBookings() {
    return db
      .select()
      .from(bookingRequestsTable)
      .orderBy(desc(bookingRequestsTable.createdAt));
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
      .delete(bookingRequestsTable)
      .where(eq(bookingRequestsTable.requestGroupId, requestGroupId));
  }
}
