import { eggLog, expense } from "@lib/db/schema-postgres";
import { getSummaryData } from "@lib/fetch-optimized";
import { executeWithRetry } from "@lib/db/utils";
import { endOfDay, format, startOfDay, subMonths } from "date-fns";
import { and, between, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const statsRouter = router({
  getStats: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
        range: z.object({
          from: z.date(),
          to: z.date(),
        }),
        today: z.union([z.date(), z.string()]),
        breedFilter: z.array(z.string()).nullable().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return executeWithRetry(async () => {
        const today = endOfDay(input.range.to);
        const from = startOfDay(input.range.from);
        const to = endOfDay(input.range.to);
        
        // Get all required data with one database transaction 
        // to minimize connection overhead
        const result = await ctx.db.transaction(async (tx) => {
          // Calculate week ranges
          const [beginThisWeek, endThisWeek] = getThisWeek(today);
          const [beginLastWeek, endLastWeek] = getLastWeek(today);

          // Execute all queries in parallel
          const [getLogs, thisWeekStats, lastWeekStats] = await Promise.all([
            // Query 1: Get all logs within date range
            tx
              .select({
                date: eggLog.date,
                count: eggLog.count,
              })
              .from(eggLog)
              .where(
                and(
                  eq(eggLog.flockId, input.flockId),
                  between(
                    eggLog.date,
                    format(from, "yyyy-MM-dd"),
                    format(to, "yyyy-MM-dd"),
                  ),
                  input.breedFilter
                    ? inArray(eggLog.breedId, input.breedFilter)
                    : undefined,
                ),
              )
              .orderBy(({ date }) => desc(date)),
            
            // Query 2: This week's average
            tx
              .select({
                avg: sql<number>`avg(${eggLog.count})`,
              })
              .from(eggLog)
              .where(
                and(
                  eq(eggLog.flockId, input.flockId),
                  between(
                    eggLog.date,
                    format(beginThisWeek, "yyyy-MM-dd"),
                    format(endThisWeek, "yyyy-MM-dd"),
                  ),
                ),
              ),
              
            // Query 3: Last week's average
            tx
              .select({
                avg: sql<number>`avg(${eggLog.count})`,
              })
              .from(eggLog)
              .where(
                and(
                  eq(eggLog.flockId, input.flockId),
                  between(
                    eggLog.date,
                    format(beginLastWeek, "yyyy-MM-dd"),
                    format(endLastWeek, "yyyy-MM-dd"),
                  ),
                ),
              )
          ]);
          
          return {
            getLogs,
            thisWeeksAvg: thisWeekStats[0],
            lastWeeksAvg: lastWeekStats[0]
          };
        });

        return result;
      }, {
        maxRetries: 3,
        operation: "Get stats data"
      });
    }),

  getExpenseStats: protectedProcedure
    .input(
      z.object({
        today: z.union([z.date(), z.string()]),
        flockId: z.string(),
        numMonths: z.number().default(6),
      }),
    )
    .query(async ({ input, ctx }) => {
      return executeWithRetry(async () => {
        const dates = [new Date(input.today)];

        for (let i = 1; i < input.numMonths; i++) {
          dates.push(subMonths(dates[i - 1]!, 1));
        }

        // Execute both queries in parallel instead of sequentially
        const [expenses, production] = await Promise.all([
          // Query 1: Get expenses grouped by month/year
          ctx.db
            .select({
              flockId: expense.flockId,
              category: expense.category,
              total: sql<number>`sum(${expense.amount})`,
              monthYear: sql<string>`concat(EXTRACT(MONTH FROM ${expense.date}), '/', EXTRACT(YEAR FROM ${expense.date}))`,
            })
            .from(expense)
            .where(
              and(
                eq(expense.flockId, input.flockId),
                between(
                  expense.date,
                  format(dates[dates.length - 1]!.setDate(1), "yyyy-MM-dd"),
                  format(dates[0]!, "yyyy-MM-dd"),
                ),
              ),
            )
            .groupBy(({ flockId, monthYear, category }) => [
              flockId,
              monthYear,
              category,
            ]),
            
          // Query 2: Get production grouped by month/year
          ctx.db
            .select({
              flockId: eggLog.flockId,
              total: sql<number>`sum(${eggLog.count})`,
              monthYear: sql<string>`concat(EXTRACT(MONTH FROM ${eggLog.date}), '/', EXTRACT(YEAR FROM ${eggLog.date}))`,
            })
            .from(eggLog)
            .where(
              and(
                eq(eggLog.flockId, input.flockId),
                between(
                  eggLog.date,
                  format(dates[dates.length - 1]!.setDate(1), "yyyy-MM-dd"),
                  format(dates[0]!, "yyyy-MM-dd"),
                ),
              ),
            )
            .groupBy(({ flockId, monthYear }) => [flockId, monthYear])
        ]);

        return {
          expenses,
          production,
        };
      }, {
        maxRetries: 3,
        operation: "Get expense stats"
      });
    }),

  getFlockSummary: protectedProcedure
    .input(
      z.object({ flockId: z.string(), month: z.string(), year: z.string() }),
    )
    .query(async ({ input }) => {
      // Using the optimized getSummaryData function
      const summary = await getSummaryData({
        flockId: input.flockId,
        month: input.month,
        year: input.year,
      });

      return summary;
    }),

  getBreedStats: protectedProcedure
    .input(
      z.object({ today: z.union([z.date(), z.string()]), flockId: z.string() }),
    )
    .query(async ({ input, ctx }) => {
      return executeWithRetry(async () => {
        const today = new Date(input.today);
        today.setHours(23, 59, 59, 999);
  
        const [beginThisWeek, endThisWeek] = getThisWeek(today);
  
        const avg = await ctx.db
          .select({
            breedId: eggLog.breedId,
            avgCount: sql<number>`avg(${eggLog.count})`,
          })
          .from(eggLog)
          .where(
            and(
              eq(eggLog.flockId, input.flockId),
              between(
                eggLog.date,
                format(beginThisWeek, "yyyy-MM-dd"),
                format(endThisWeek, "yyyy-MM-dd"),
              ),
            ),
          )
          .groupBy(eggLog.breedId)
          .orderBy(({ avgCount }) => desc(avgCount));
  
        return avg;
      }, {
        maxRetries: 2,
        operation: "Get breed stats"
      });
    }),
});

function getThisWeek(today: Date): [beginningofWeek: Date, endofWeek: Date] {
  today.setHours(0, 0, 0, 0);
  let tempDate = new Date(today);
  const dayOfWeek = today.getDay();
  const endOfWeek = new Date(
    tempDate.setDate(tempDate.getDate() + (6 - dayOfWeek)),
  );
  endOfWeek.setHours(23, 59, 59, 999);
  tempDate = new Date(today);
  const beginningOfWeek = new Date(
    tempDate.setDate(tempDate.getDate() - dayOfWeek),
  );

  return [beginningOfWeek, endOfWeek];
}

function getLastWeek(today: Date): [beginningofWeek: Date, endOfWeek: Date] {
  const dayLastWeek = today;
  dayLastWeek.setDate(dayLastWeek.getDate() - 7);
  dayLastWeek.setHours(0, 0, 0, 0);

  let tempDate = new Date(dayLastWeek);
  const dayOfWeek = dayLastWeek.getDay();
  const endOfWeek = new Date(
    tempDate.setDate(tempDate.getDate() + (6 - dayOfWeek)),
  );
  endOfWeek.setHours(23, 59, 59, 999);
  tempDate = new Date(dayLastWeek);
  const beginningOfWeek = new Date(
    tempDate.setDate(tempDate.getDate() - dayOfWeek),
  );

  return [beginningOfWeek, endOfWeek];
}