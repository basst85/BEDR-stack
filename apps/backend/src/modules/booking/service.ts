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

    await db.insert(bookingRequestsTable).values(
      Array.from(groupedLines.entries()).map(([unitType, quantity]) => ({
        id: crypto.randomUUID(),
        requestGroupId,
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
      confirmationCode: `VV-${requestGroupId.slice(0, 8).toUpperCase()}`,
      lines: Array.from(groupedLines.entries()).map(([unitType, quantity]) => ({
        unitType,
        quantity,
        remaining: (availabilityByUnitType.get(unitType)?.remaining ?? 0) - quantity,
      })),
      status: 'pending' as const,
    };
  }
}