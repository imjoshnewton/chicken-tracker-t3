import { expense, flock } from "@lib/db/schema-postgres";
import { eq, and, desc, between, sql } from "drizzle-orm";
import { db } from "@lib/db";

type DBOrTx = typeof db;

/**
 * Get all expenses for a user across all flocks, paginated and ordered by date descending.
 */
export const getAllExpenses = async (
  dbOrTx: DBOrTx,
  userId: string,
  page: number,
  pageSize: number = 25,
) => {
  return dbOrTx
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
    .offset(page * pageSize)
    .limit(pageSize);
};

/**
 * Get expenses for a specific flock belonging to a user, paginated and ordered by date descending.
 */
export const getExpensesByFlock = async (
  dbOrTx: DBOrTx,
  userId: string,
  flockId: string,
  page: number,
  pageSize: number = 25,
) => {
  return dbOrTx
    .select({
      id: expense.id,
      date: expense.date,
      amount: expense.amount,
      category: expense.category,
      memo: expense.memo,
      flockId: expense.flockId,
    })
    .from(flock)
    .where(and(eq(flock.userId, userId), eq(flock.id, flockId)))
    .innerJoin(expense, eq(expense.flockId, flock.id))
    .orderBy(desc(expense.date))
    .offset(page * pageSize)
    .limit(pageSize);
};

/**
 * Get the total count of expenses across all flocks for a user.
 */
export const getAllExpenseCount = async (dbOrTx: DBOrTx, userId: string) => {
  const [result] = await dbOrTx
    .select({ count: sql<number>`count(*)` })
    .from(flock)
    .where(eq(flock.userId, userId))
    .innerJoin(expense, eq(expense.flockId, flock.id));
  return result ? result.count : 0;
};

/**
 * Get the total count of expenses for a specific flock belonging to a user.
 */
export const getExpenseCountByFlock = async (
  dbOrTx: DBOrTx,
  userId: string,
  flockId: string,
) => {
  const [result] = await dbOrTx
    .select({ count: sql<number>`count(*)` })
    .from(flock)
    .where(and(eq(flock.userId, userId), eq(flock.id, flockId)))
    .innerJoin(expense, eq(expense.flockId, flock.id));
  return result ? result.count : 0;
};

/**
 * Create a new expense record.
 */
export const createExpense = async (
  dbOrTx: DBOrTx,
  data: {
    id: string;
    flockId: string;
    date: string;
    amount: number;
    memo?: string;
    category: string;
  },
) => {
  return dbOrTx.insert(expense).values([data]);
};

/**
 * Delete an expense by ID and return the deleted record.
 */
export const deleteExpense = async (dbOrTx: DBOrTx, expenseId: string) => {
  return dbOrTx.delete(expense).where(eq(expense.id, expenseId)).returning();
};

/**
 * Get expenses grouped by month and category for a flock within a date range.
 */
export const getExpensesByMonth = async (
  dbOrTx: DBOrTx,
  flockId: string,
  from: string,
  to: string,
) => {
  return dbOrTx
    .select({
      flockId: expense.flockId,
      category: expense.category,
      total: sql<number>`sum(${expense.amount})`,
      monthYear: sql<string>`concat(EXTRACT(MONTH FROM ${expense.date}), '/', EXTRACT(YEAR FROM ${expense.date}))`,
    })
    .from(expense)
    .where(and(eq(expense.flockId, flockId), between(expense.date, from, to)))
    .groupBy(
      expense.flockId,
      sql`concat(EXTRACT(MONTH FROM ${expense.date}), '/', EXTRACT(YEAR FROM ${expense.date}))`,
      expense.category,
    );
};

/**
 * Get expense totals grouped by category for a flock within a date range.
 */
export const getExpensesByCategory = async (
  dbOrTx: DBOrTx,
  flockId: string,
  from: string,
  to: string,
) => {
  return dbOrTx
    .select({
      category: expense.category,
      amountByCategory: sql<number>`sum(${expense.amount})`,
    })
    .from(expense)
    .where(and(eq(expense.flockId, flockId), between(expense.date, from, to)))
    .groupBy(expense.category);
};
