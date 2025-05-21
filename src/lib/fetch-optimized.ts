import { addMonths, format, getDaysInMonth } from "date-fns";
import { and, between, desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { eggLog, expense, flock } from "./db/schema-postgres";
import { executeWithRetry } from "./db/utils";

export const PAGE_SIZE = 25;

// Optimized fetch expenses function - gets data and count in a single operation
export async function fetchExpenses(
  userId: string,
  page: number,
  flockId?: string,
) {
  return executeWithRetry(async () => {
    // Single query that returns both the data and the count
    const result = await db.transaction(async (tx) => {
      const baseQuery = tx
        .select({
          id: expense.id,
          date: expense.date,
          amount: expense.amount,
          category: expense.category,
          memo: expense.memo,
          flockId: expense.flockId,
        })
        .from(flock)
        .where(
          flockId 
            ? and(eq(flock.userId, userId), eq(flock.id, flockId))
            : eq(flock.userId, userId)
        )
        .innerJoin(expense, eq(expense.flockId, flock.id))
        .orderBy(desc(expense.date));

      // Clone the query for count
      const countQuery = tx
        .select({
          count: sql<number>`count(*)`,
        })
        .from(flock)
        .where(
          flockId 
            ? and(eq(flock.userId, userId), eq(flock.id, flockId))
            : eq(flock.userId, userId)
        )
        .innerJoin(expense, eq(expense.flockId, flock.id));

      // Execute both queries in parallel
      const [expenses, [countResult]] = await Promise.all([
        baseQuery.offset(page * PAGE_SIZE).limit(PAGE_SIZE),
        countQuery
      ]);

      return {
        expenses,
        count: countResult?.count || 0
      };
    });

    const totalPages = Math.ceil(result.count / PAGE_SIZE);
    return [result.expenses, totalPages] as const;
  }, {
    maxRetries: 2,
    operation: "Fetch expenses"
  });
}

// Optimized fetch logs function - gets data and count in a single operation
export async function fetchLogs(
  userId: string,
  page: number,
  flockId?: string,
) {
  return executeWithRetry(async () => {
    // Single query that returns both the data and the count
    const result = await db.transaction(async (tx) => {
      const baseQuery = tx
        .select({
          id: eggLog.id,
          date: eggLog.date,
          count: eggLog.count,
          flockId: flock.id,
          notes: eggLog.notes,
          breedId: eggLog.breedId,
        })
        .from(flock)
        .where(
          flockId 
            ? and(eq(flock.userId, userId), eq(flock.id, flockId))
            : eq(flock.userId, userId)
        )
        .innerJoin(eggLog, eq(eggLog.flockId, flock.id))
        .orderBy(desc(eggLog.date));

      // Clone the query for count
      const countQuery = tx
        .select({
          count: sql<number>`count(*)`,
        })
        .from(flock)
        .where(
          flockId 
            ? and(eq(flock.userId, userId), eq(flock.id, flockId))
            : eq(flock.userId, userId)
        )
        .innerJoin(eggLog, eq(eggLog.flockId, flock.id));

      // Execute both queries in parallel
      const [logs, [countResult]] = await Promise.all([
        baseQuery.offset(page * PAGE_SIZE).limit(PAGE_SIZE),
        countQuery
      ]);

      return {
        logs,
        count: countResult?.count || 0
      };
    });

    const totalPages = Math.ceil(result.count / PAGE_SIZE);
    return [result.logs, totalPages] as const;
  }, {
    maxRetries: 2,
    operation: "Fetch logs"
  });
}

// Optimized summary data function - consolidates multiple queries
export async function getSummaryData({
  month,
  year,
  flockId,
}: {
  month: string;
  year: string;
  flockId: string;
}) {
  return executeWithRetry(async () => {
    const startOfMonth = new Date(`${month}/01/${year}`);
    const startOfNextMonth = addMonths(startOfMonth, 1);
    
    // Execute all queries in parallel instead of sequentially
    const [flockData, expenseData, logStats] = await Promise.all([
      // Get flock data
      db.query.flock.findFirst({
        where: eq(flock.id, flockId),
        with: {
          breeds: true,
        },
      }),
      
      // Get expense data
      db
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
        .groupBy(expense.category),
        
      // Get log stats in a single query instead of multiple
      db
        .select({
          count: sql<number>`count(${eggLog.id})`,
          avg: sql<number>`avg(${eggLog.count})`,
          sum: sql<number>`sum(${eggLog.count})`,
          max: sql<number>`max(${eggLog.count})`,
        })
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
    ]);

    if (!flockData) {
      return null;
    }

    const totalExpenses =
      expenseData.length === 0
        ? 0
        : expenseData
            .map((exp) => exp.amountByCategory ?? 0)
            .reduce((acc, cur) => acc + cur, 0);

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
        total: logStats[0]?.sum ?? 0,
        numLogs: logStats[0]?.count ?? 0,
        average: logStats[0]?.avg ?? 0,
        calcAvg: (logStats[0]?.sum ?? 0) / getDaysInMonth(startOfMonth),
        largest: logStats[0]?.max ?? 0,
      },
      year: startOfMonth.toLocaleString("default", { year: "numeric" }),
      month: startOfMonth.toLocaleString("default", { month: "long" }),
    };
  }, {
    maxRetries: 2,
    operation: "Get summary data"
  });
}