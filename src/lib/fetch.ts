import { addMonths, format, getDaysInMonth } from "date-fns";
import { and, between, desc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "./db";
import { eggLog, expense, flock } from "./db/schema";

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

  return flockJoin;
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

// Feetch logs function - takes an optional flockId and calls the correct fetch function
export async function fetchLogs(
  userId: string,
  page: number,
  flockId?: string,
) {
  if (flockId) {
    return await fetchLogsByFlock(userId, flockId, page);
  } else {
    return await fetchAllLogs(userId, page);
  }
}

// Fetch all logs function
export async function fetchAllLogs(userId: string, page: number) {
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

  return flockJoin;
}

// Fet logs by flock function
export async function fetchLogsByFlock(
  userId: string,
  flockId: string,
  page: number,
) {
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
    .where(and(eq(flock.userId, userId), eq(flock.id, flockId)))
    .innerJoin(eggLog, eq(eggLog.flockId, flock.id))
    .orderBy(desc(eggLog.date))
    .offset(page * PAGE_SIZE)
    .limit(PAGE_SIZE);

  return flockJoin;
}

// Fetch log count function - takes an optional flockId and calls the correct fetch function
export async function fetchLogCount(
  userId: string,
  flockId?: string,
): Promise<number> {
  if (flockId) {
    return await fetchLogCountByFlock(userId, flockId);
  } else {
    return await fetchAllLogCount(userId);
  }
}

// Fetch all log count function
export async function fetchAllLogCount(userId: string) {
  const [result] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(flock)
    .where(eq(flock.userId, userId))
    .innerJoin(eggLog, eq(eggLog.flockId, flock.id));

  return result ? result.count : 0;
}

// Fetch log count by flock function
export async function fetchLogCountByFlock(userId: string, flockId: string) {
  const [result] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(flock)
    .where(and(eq(flock.userId, userId), eq(flock.id, flockId)))
    .innerJoin(eggLog, eq(eggLog.flockId, flock.id));

  return result ? result.count : 0;
}

export async function getSummaryData({
  month,
  year,
  flockId,
}: {
  month: string;
  year: string;
  flockId: string;
}) {
  const startOfMonth = new Date(`${month}/01/${year}`);
  const startOfNextMonth = addMonths(startOfMonth, 1);

  // console.log("Start of this month: ", startOfMonth);
  // console.log("Start of next month: ", startOfNextMonth);

  const flockData = await db.query.flock.findFirst({
    where: eq(flock.id, flockId),
    with: {
      breeds: true,
    },
  });

  if (!flockData) {
    return null;
  }

  const expenseData = await db
    .select({
      category: expense.category,
      amountByCategory: sql<number>`sum(${expense.amount})`,
    })
    .from(expense)
    .where(
      and(
        eq(expense.flockId, flockId),
        between(
          expense.date,
          format(startOfMonth, "yyyy-MM-dd"),
          format(startOfNextMonth, "yyyy-MM-dd"),
        ),
      ),
    )
    .groupBy(expense.category);

  const totalExpenses =
    expenseData.length == 0
      ? 0
      : expenseData
          .map((exp) => exp.amountByCategory ?? 0)
          .reduce((acc, cur) => acc + cur, 0);

  const logs = await db
    .select()
    .from(eggLog)
    .where(
      and(
        eq(eggLog.flockId, flockId),
        between(
          eggLog.date,
          format(startOfMonth, "yyyy-MM-dd"),
          format(startOfNextMonth, "yyyy-MM-dd"),
        ),
      ),
    )
    .as("logs");

  const [logStats] = await db
    .select({
      count: sql<number>`count(${eggLog.id})`,
      avg: sql<number>`avg(${eggLog.count})`,
      sum: sql<number>`sum(${eggLog.count})`,
      max: sql<number>`max(${eggLog.count})`,
    })
    .from(logs);

  return {
    flock: {
      id: flockData?.id,
      name: flockData?.name,
      image: flockData?.imageUrl,
    },
    expenses: {
      total: totalExpenses,
      categories: expenseData.map((exp) => {
        return {
          category: exp.category,
          amount: exp.amountByCategory ?? 0,
        };
      }),
    },
    logs: {
      total: logStats?.sum ?? 0,
      numLogs: logStats?.count ?? 0,
      average: logStats?.avg ?? 0,
      calcAvg: (logStats?.sum ?? 0) / getDaysInMonth(startOfMonth),
      largest: logStats?.max ?? 0,
    },
    year: startOfMonth.toLocaleString("default", { year: "numeric" }),
    month: startOfMonth.toLocaleString("default", { month: "long" }),
  };
}
