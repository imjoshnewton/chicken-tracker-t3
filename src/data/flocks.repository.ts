import { flock, breed, task, user } from "@lib/db/schema-postgres";
import { eq } from "drizzle-orm";
import { db } from "@lib/db";

type DBOrTx = typeof db;

/**
 * Get a flock by ID with its active (non-deleted) breeds, ordered by breed ID.
 */
export async function getFlockById(dbOrTx: DBOrTx, flockId: string) {
  return dbOrTx.query.flock.findFirst({
    where: eq(flock.id, flockId),
    with: {
      breeds: {
        where: eq(breed.deleted, false),
        orderBy: (breeds, { asc }) => [asc(breeds.id)],
      },
    },
  });
}

/**
 * Get all tasks for a given flock.
 */
export async function getFlockTasks(dbOrTx: DBOrTx, flockId: string) {
  return dbOrTx.select().from(task).where(eq(task.flockId, flockId));
}

/**
 * Get all flocks belonging to a user, returning a subset of flock fields.
 */
export async function getFlocksByUserId(dbOrTx: DBOrTx, userId: string) {
  return dbOrTx
    .select({
      id: flock.id,
      name: flock.name,
      description: flock.description,
      imageUrl: flock.imageUrl,
      type: flock.type,
      userId: flock.userId,
    })
    .from(user)
    .where(eq(user.id, userId))
    .innerJoin(flock, eq(flock.userId, user.id));
}

/**
 * Create a new flock and return the inserted record.
 */
export async function createFlock(
  dbOrTx: DBOrTx,
  data: {
    id: string;
    name: string;
    description: string;
    type: string;
    imageUrl: string | null;
    userId: string;
  },
) {
  return dbOrTx
    .insert(flock)
    .values([
      {
        ...data,
        imageUrl: data.imageUrl || "",
        userId: data.userId,
      },
    ])
    .returning();
}

/**
 * Update an existing flock by ID and return the updated record.
 */
export async function updateFlock(
  dbOrTx: DBOrTx,
  id: string,
  data: {
    name: string;
    description: string;
    type: string;
    imageUrl: string | null;
  },
) {
  return dbOrTx
    .update(flock)
    .set({
      ...data,
      imageUrl: data.imageUrl || "",
    })
    .where(eq(flock.id, id))
    .returning();
}

/**
 * Delete a flock by ID. Returns the flock record that existed before deletion.
 * Performs a select then delete so the caller can inspect what was removed.
 */
export async function deleteFlock(dbOrTx: DBOrTx, flockId: string) {
  const [existing] = await dbOrTx
    .select()
    .from(flock)
    .where(eq(flock.id, flockId));

  if (!existing) {
    return null;
  }

  await dbOrTx.delete(flock).where(eq(flock.id, flockId));

  return existing;
}

/**
 * Get basic flock data by ID with all breeds (including deleted).
 * Used for summary/overview screens where breed-level detail is needed
 * without filtering.
 */
export async function getFlockBasic(dbOrTx: DBOrTx, flockId: string) {
  return dbOrTx.query.flock.findFirst({
    where: eq(flock.id, flockId),
    with: { breeds: true },
  });
}
