import { asc, eq } from 'drizzle-orm';

import { db } from '@backend/core/db';

import { locationsTable } from './locations.model';

export class LocationsService {
  async getAll() {
    return db.select().from(locationsTable).orderBy(asc(locationsTable.sortOrder));
  }

  async update(id: string, payload: { name: string; address: string }) {
    const existing = await db
      .select({ id: locationsTable.id })
      .from(locationsTable)
      .where(eq(locationsTable.id, id))
      .get();

    if (!existing) {
      throw new Error('Locatie niet gevonden.');
    }

    await db
      .update(locationsTable)
      .set({
        name: payload.name,
        address: payload.address,
        updatedAt: new Date(),
      })
      .where(eq(locationsTable.id, id));
  }
}
