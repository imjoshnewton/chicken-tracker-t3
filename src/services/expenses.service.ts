import * as expensesRepo from "../data/expenses.repository";
import { db } from "@lib/db";
import { executeWithRetry } from "@lib/db/utils";
import { createId } from "@paralleldrive/cuid2";
import { format } from "date-fns";

const PAGE_SIZE = 25;

const formatDateForDB = (dateObj: Date) => {
  return format(dateObj, "yyyy-MM-dd HH:mm:ss.SSS");
};

export const getExpenses = async (userId: string, page: number, flockId?: string) => {
  let expenses;
  let count;
  if (flockId) {
    expenses = await expensesRepo.getExpensesByFlock(db, userId, flockId, page, PAGE_SIZE);
    count = await expensesRepo.getExpenseCountByFlock(db, userId, flockId);
  } else {
    expenses = await expensesRepo.getAllExpenses(db, userId, page, PAGE_SIZE);
    count = await expensesRepo.getAllExpenseCount(db, userId);
  }
  const totalPages = Math.ceil(count / PAGE_SIZE);
  return [expenses, totalPages] as const;
};

export const createExpense = async (data: {
  flockId: string;
  date: Date;
  amount: number;
  memo?: string;
  category: string;
}) => {
  const id = createId();
  return expensesRepo.createExpense(db, {
    id,
    ...data,
    date: formatDateForDB(data.date),
  });
};

export const deleteExpense = async (expenseId: string) => {
  return executeWithRetry(async () => {
    const result = await expensesRepo.deleteExpense(db, expenseId);
    return result[0];
  }, { maxRetries: 2, operation: "Delete expense" });
};
