import { eggLog, flock } from "@lib/db/schema-postgres";
import { eq, and, desc, between, inArray, sql } from "drizzle-orm";
import { db } from "@lib/db";

type DBOrTx = typeof db;

export async function getLogsByUserId(
  dbOrTx: DBOrTx,
  userId: string,
  page: number,
  pageSize: number = 25,
) {
  return dbOrTx
    .select({
      id: eggLog.id,
      date: eggLog.date,
      count: eggLog.count,
      flockId: flock.id,
      notes: eggLog.notes,
      breedId: eggLog.breedId,
    })
    .from(flock)
    .where(eq(flock.userId, userId))
    .innerJoin(eggLog, eq(eggLog.flockId, flock.id))
    .orderBy(desc(eggLog.date))
    .offset(page * pageSize)
    .limit(pageSize);
}

export async function getLogsByFlock(
  dbOrTx: DBOrTx,
  userId: string,
  flockId: string,
  page: number,
  pageSize: number = 25,
) {
  return dbOrTx
    .select({
      id: eggLog.id,
      date: eggLog.date,
      count: eggLog.count,
      flockId: flock.id,
      notes: eggLog.notes,
      breedId: eggLog.breedId,
    })
    .from(flock)
    .where(and(eq(flock.userId, userId), eq(flock.id, flockId)))
    .innerJoin(eggLog, eq(eggLog.flockId, flock.id))
    .orderBy(desc(eggLog.date))
    .offset(page * pageSize)
    .limit(pageSize);
}

export async function getLogCount(dbOrTx: DBOrTx, userId: string) {
  const [result] = await dbOrTx
    .select({ count: sql<number>`count(*)` })
    .from(flock)
    .where(eq(flock.userId, userId))
    .innerJoin(eggLog, eq(eggLog.flockId, flock.id));
  return result ? result.count : 0;
}

export async function getLogCountByFlock(
  dbOrTx: DBOrTx,
  userId: string,
  flockId: string,
) {
  const [result] = await dbOrTx
    .select({ count: sql<number>`count(*)` })
    .from(flock)
    .where(and(eq(flock.userId, userId), eq(flock.id, flockId)))
    .innerJoin(eggLog, eq(eggLog.flockId, flock.id));
  return result ? result.count : 0;
}

export async function createLog(
  dbOrTx: DBOrTx,
  data: {
    id: string;
    flockId: string;
    date: string;
    count: number;
    breedId?: string;
    notes?: string;
  },
) {
  return dbOrTx.insert(eggLog).values([data]);
}

export async function deleteLog(dbOrTx: DBOrTx, logId: string) {
  return dbOrTx.delete(eggLog).where(eq(eggLog.id, logId)).returning();
}

export async function getLogsByFlockAndDateRange(
  dbOrTx: DBOrTx,
  flockId: string,
  from: string,
  to: string,
  breedFilter?: string[],
) {
  return dbOrTx
    .select({ date: eggLog.date, count: eggLog.count })
    .from(eggLog)
    .where(
      and(
        eq(eggLog.flockId, flockId),
        between(eggLog.date, from, to),
        breedFilter ? inArray(eggLog.breedId, breedFilter) : undefined,
      ),
    )
    .orderBy(desc(eggLog.date));
}

export async function getAvgLogsByDateRange(
  dbOrTx: DBOrTx,
  flockId: string,
  from: string,
  to: string,
) {
  const [result] = await dbOrTx
    .select({ avg: sql<number>`avg(${eggLog.count})` })
    .from(eggLog)
    .where(and(eq(eggLog.flockId, flockId), between(eggLog.date, from, to)));
  return result;
}

export async function getBreedStatsByDateRange(
  dbOrTx: DBOrTx,
  flockId: string,
  from: string,
  to: string,
) {
  return dbOrTx
    .select({
      breedId: eggLog.breedId,
      avgCount: sql<number>`avg(${eggLog.count})`,
    })
    .from(eggLog)
    .where(and(eq(eggLog.flockId, flockId), between(eggLog.date, from, to)))
    .groupBy(eggLog.breedId)
    .orderBy(desc(sql`avg(${eggLog.count})`));
}

export async function getLogStatsByDateRange(
  dbOrTx: DBOrTx,
  flockId: string,
  from: string,
  to: string,
) {
  const logs = dbOrTx
    .select()
    .from(eggLog)
    .where(and(eq(eggLog.flockId, flockId), between(eggLog.date, from, to)))
    .as("logs");

  const [stats] = await dbOrTx
    .select({
      count: sql<number>`count(${eggLog.id})`,
      avg: sql<number>`avg(${eggLog.count})`,
      sum: sql<number>`sum(${eggLog.count})`,
      max: sql<number>`max(${eggLog.count})`,
    })
    .from(logs);

  return stats;
}

export async function getProductionByMonth(
  dbOrTx: DBOrTx,
  flockId: string,
  from: string,
  to: string,
) {
  return dbOrTx
    .select({
      flockId: eggLog.flockId,
      total: sql<number>`sum(${eggLog.count})`,
      monthYear: sql<string>`concat(EXTRACT(MONTH FROM ${eggLog.date}), '/', EXTRACT(YEAR FROM ${eggLog.date}))`,
    })
    .from(eggLog)
    .where(and(eq(eggLog.flockId, flockId), between(eggLog.date, from, to)))
    .groupBy(
      eggLog.flockId,
      sql`concat(EXTRACT(MONTH FROM ${eggLog.date}), '/', EXTRACT(YEAR FROM ${eggLog.date}))`,
    );
}
