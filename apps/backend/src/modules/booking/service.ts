import { eq, sql } from 'drizzle-orm';

import { config } from '@backend/core/config';
import { db } from '@backend/core/db';

import {
  bookingRequestsTable,
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

export class BookingInventoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingInventoryError';
  }
}

export class BookingService {
  async getAvailability() {
    const reservations = await db
      .select({
        unitType: bookingRequestsTable.unitType,
        reserved: sql<number>`coalesce(sum(${bookingRequestsTable.quantity}), 0)`,
      })
      .from(bookingRequestsTable)
      .groupBy(bookingRequestsTable.unitType);

    const reservedMap = new Map(reservations.map((item) => [item.unitType, Number(item.reserved)]));

    return unitTypeValues.map((unitType) => {
      const reserved = reservedMap.get(unitType) ?? 0;
      const stockLimit = config.bookingStockByUnitType[unitType];

      return {
        unitType,
        title: unitCatalog[unitType].title,
        stockLimit,
        reserved,
        remaining: Math.max(stockLimit - reserved, 0),
      };
    });
  }

  async create(payload: BookingRequestPayload) {
    if (!validUnitTypes.has(payload.unitType as UnitTypeValue)) {
      throw new BookingInventoryError('Unknown unit type selected.');
    }

    const unitType = payload.unitType as UnitTypeValue;
    const reserved = await this.getReservedCount(unitType);
  const stockLimit = config.bookingStockByUnitType[unitType];
    const remaining = stockLimit - reserved;

    if (payload.quantity > remaining) {
      throw new BookingInventoryError(
        remaining > 0
          ? `Only ${remaining} unit(s) remain for this type.`
          : 'This unit type is fully booked.',
      );
    }

    const id = crypto.randomUUID();

    await db.insert(bookingRequestsTable).values({
      id,
      unitType,
      quantity: payload.quantity,
      guestName: payload.guestName,
      guestEmail: payload.guestEmail,
      guestPhone: payload.guestPhone,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      notes: payload.notes,
      status: 'pending',
    });

    return {
      id,
      confirmationCode: `VV-${id.slice(0, 8).toUpperCase()}`,
      unitType,
      quantity: payload.quantity,
      status: 'pending' as const,
      remaining: remaining - payload.quantity,
    };
  }

  private async getReservedCount(unitType: UnitTypeValue) {
    const result = await db
      .select({
        reserved: sql<number>`coalesce(sum(${bookingRequestsTable.quantity}), 0)`,
      })
      .from(bookingRequestsTable)
      .where(eq(bookingRequestsTable.unitType, unitType));

    return Number(result[0]?.reserved ?? 0);
  }
}