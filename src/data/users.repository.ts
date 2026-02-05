import { user } from "@lib/db/schema-postgres";
import { eq, sql } from "drizzle-orm";
import { db } from "@lib/db";

type DBOrTx = typeof db;

export const getUserByClerkId = async (dbOrTx: DBOrTx, clerkId: string) => {
  const [dbUser] = await dbOrTx
    .select()
    .from(user)
    .where(sql`${user.clerkId} = ${clerkId} OR ${user.secondaryClerkId} = ${clerkId}`)
    .limit(1);
  return dbUser;
};

export const updateUser = async (dbOrTx: DBOrTx, userId: string, data: { name: string; image: string }) => {
  return dbOrTx
    .update(user)
    .set({ name: data.name, image: data.image })
    .where(eq(user.id, userId))
    .returning();
};

export const setDefaultFlock = async (dbOrTx: DBOrTx, userId: string, flockId: string) => {
  return dbOrTx
    .update(user)
    .set({ defaultFlock: flockId })
    .where(eq(user.id, userId));
};
