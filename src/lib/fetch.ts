import { db } from "./db";
import { eggLog, expense, flock } from "./db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

export const PAGE_SIZE = 25;

// Fetch expenses function
export async function fetchExpenses(userId: string, page: number) {
  const flockJoin = await db
    .select({
      id: expense.id,
      date: expense.date,
      amount: expense.amount,
      category: expense.category,
      memo: expense.memo,
      flockId: expense.flockId,
    })
    .from(flock)
    .where(eq(flock.userId, userId))
    .innerJoin(expense, eq(expense.flockId, flock.id))
    .orderBy(desc(expense.date))
    .offset(page * PAGE_SIZE)
    .limit(PAGE_SIZE);

  return flockJoin.map((f) => {
    return {
      ...f,
      date: new Date(f.date),
    };
  });
}

// Fetch expense count function
export async function fetchExpenseCount(userId: string) {
  if (!userId) redirect("/api/auth/signin");

  const [result] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(flock)
    .where(eq(flock.userId, userId))
    .innerJoin(expense, eq(expense.flockId, flock.id));

  return result ? result.count : 0;
}

// Fetch logs function
export async function fetchLogs(userId: string, page: number) {
  const flockJoin = await db
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
    .offset(page * PAGE_SIZE)
    .limit(PAGE_SIZE);

  return flockJoin.map((f) => {
    return {
      ...f,
      date: new Date(f.date),
    };
  });
}

export async function fetchLogCount(userId: string) {
  const [result] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(flock)
    .where(eq(flock.userId, userId))
    .innerJoin(eggLog, eq(eggLog.flockId, flock.id));

  return result ? result.count : 0;
}
