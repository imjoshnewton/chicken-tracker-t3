import * as logsRepo from "../data/logs.repository";
import * as expensesRepo from "../data/expenses.repository";
import * as flocksRepo from "../data/flocks.repository";
import { db } from "@lib/db";
import { endOfDay, format, startOfDay, subMonths, addMonths, getDaysInMonth } from "date-fns";

function getThisWeek(today: Date): [Date, Date] {
  today.setHours(0, 0, 0, 0);
  let tempDate = new Date(today);
  const dayOfWeek = today.getDay();
  const endOfWeek = new Date(tempDate.setDate(tempDate.getDate() + (6 - dayOfWeek)));
  endOfWeek.setHours(23, 59, 59, 999);
  tempDate = new Date(today);
  const beginningOfWeek = new Date(tempDate.setDate(tempDate.getDate() - dayOfWeek));
  return [beginningOfWeek, endOfWeek];
}

function getLastWeek(today: Date): [Date, Date] {
  const dayLastWeek = today;
  dayLastWeek.setDate(dayLastWeek.getDate() - 7);
  dayLastWeek.setHours(0, 0, 0, 0);
  let tempDate = new Date(dayLastWeek);
  const dayOfWeek = dayLastWeek.getDay();
  const endOfWeek = new Date(tempDate.setDate(tempDate.getDate() + (6 - dayOfWeek)));
  endOfWeek.setHours(23, 59, 59, 999);
  tempDate = new Date(dayLastWeek);
  const beginningOfWeek = new Date(tempDate.setDate(tempDate.getDate() - dayOfWeek));
  return [beginningOfWeek, endOfWeek];
}

export const getStats = async (input: {
  flockId: string;
  range: { from: Date; to: Date };
  today: Date | string;
  breedFilter?: string[] | null;
}) => {
  const today = endOfDay(input.range.to);
  const from = startOfDay(input.range.from);
  const to = endOfDay(input.range.to);

  const getLogs = await logsRepo.getLogsByFlockAndDateRange(
    db, input.flockId,
    format(from, "yyyy-MM-dd"),
    format(to, "yyyy-MM-dd"),
    input.breedFilter ?? undefined,
  );

  const [beginThisWeek, endThisWeek] = getThisWeek(today);
  const thisWeeksAvg = await logsRepo.getAvgLogsByDateRange(
    db, input.flockId,
    format(beginThisWeek, "yyyy-MM-dd"),
    format(endThisWeek, "yyyy-MM-dd"),
  );

  const [beginLastWeek, endLastWeek] = getLastWeek(today);
  const lastWeeksAvg = await logsRepo.getAvgLogsByDateRange(
    db, input.flockId,
    format(beginLastWeek, "yyyy-MM-dd"),
    format(endLastWeek, "yyyy-MM-dd"),
  );

  return { getLogs, thisWeeksAvg, lastWeeksAvg };
};

export const getExpenseStats = async (input: {
  today: Date | string;
  flockId: string;
  numMonths: number;
}) => {
  const dates = [new Date(input.today)];
  for (let i = 1; i < input.numMonths; i++) {
    dates.push(subMonths(dates[i - 1]!, 1));
  }

  const from = format(dates[dates.length - 1]!.setDate(1), "yyyy-MM-dd");
  const to = format(dates[0]!, "yyyy-MM-dd");

  const expenses = await expensesRepo.getExpensesByMonth(db, input.flockId, from, to);
  const production = await logsRepo.getProductionByMonth(db, input.flockId, from, to);

  return { expenses, production };
};

export const getBreedStats = async (input: {
  today: Date | string;
  flockId: string;
}) => {
  const today = new Date(input.today);
  today.setHours(23, 59, 59, 999);
  const [beginThisWeek, endThisWeek] = getThisWeek(today);

  return logsRepo.getBreedStatsByDateRange(
    db, input.flockId,
    format(beginThisWeek, "yyyy-MM-dd"),
    format(endThisWeek, "yyyy-MM-dd"),
  );
};

export const getFlockSummary = async (input: {
  flockId: string;
  month: string;
  year: string;
}) => {
  const startOfMonth = new Date(`${input.month}/01/${input.year}`);
  const startOfNextMonth = addMonths(startOfMonth, 1);

  const flockData = await flocksRepo.getFlockBasic(db, input.flockId);
  if (!flockData) return null;

  const expenseData = await expensesRepo.getExpensesByCategory(
    db, input.flockId,
    format(startOfMonth, "yyyy-MM-dd"),
    format(startOfNextMonth, "yyyy-MM-dd"),
  );

  const totalExpenses = expenseData.length === 0
    ? 0
    : expenseData.map((exp) => exp.amountByCategory ?? 0).reduce((acc, cur) => acc + cur, 0);

  const logStats = await logsRepo.getLogStatsByDateRange(
    db, input.flockId,
    format(startOfMonth, "yyyy-MM-dd"),
    format(startOfNextMonth, "yyyy-MM-dd"),
  );

  return {
    flock: { id: flockData.id, name: flockData.name, image: flockData.imageUrl },
    expenses: {
      total: totalExpenses,
      categories: expenseData.map((exp) => ({
        category: exp.category,
        amount: exp.amountByCategory ?? 0,
      })),
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
};
