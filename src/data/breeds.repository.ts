import { breed } from "@lib/db/schema-postgres";
import { eq } from "drizzle-orm";
import { db } from "@lib/db";

type DBOrTx = typeof db;

/**
 * Create a new breed record.
 */
export const createBreed = async (
  dbOrTx: DBOrTx,
  data: {
    id: string;
    name: string;
    breed: string;
    description?: string;
    count: number;
    averageProduction: number;
    imageUrl?: string;
    flockId: string;
  },
) => {
  return dbOrTx.insert(breed).values([data]);
};

/**
 * Update an existing breed by ID.
 */
export const updateBreed = async (
  dbOrTx: DBOrTx,
  data: {
    id: string;
    name?: string | null;
    breed: string;
    description: string;
    count: number;
    averageProduction: number;
    imageUrl: string;
    flockId: string;
  },
) => {
  return dbOrTx.update(breed).set(data).where(eq(breed.id, data.id));
};

/**
 * Soft-delete a breed by setting its deleted flag to true.
 */
export const deleteBreed = async (dbOrTx: DBOrTx, breedId: string) => {
  return dbOrTx
    .update(breed)
    .set({ deleted: true })
    .where(eq(breed.id, breedId));
};
