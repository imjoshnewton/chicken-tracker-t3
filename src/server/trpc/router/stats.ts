import { eggLog } from "@lib/db/schema";
import { getSummaryData } from "@lib/fetch";
import { endOfDay, format, startOfDay, subDays, subMonths } from "date-fns";
import { and, between, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const statsRouter = router({
  getStats: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
        limit: z.number(),
        today: z.union([z.date(), z.string()]),
        breedFilter: z.array(z.string()).nullable().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      var today = endOfDay(new Date(input.today));

      var pastDate = startOfDay(subDays(today, input.limit));

      console.log("Today: ", today);
      console.log("Past date: ", pastDate);

      const getLogs = await ctx.db
        .select({
          date: eggLog.date,
          count: eggLog.count,
        })
        .from(eggLog)
        .where(
          and(
            eq(eggLog.flockId, input.flockId),
            gte(eggLog.date, format(pastDate, "yyyy-MM-dd")),
            // lte(eggLog.date, format(today, "yyyy-MM-dd")),
            // between(
            //   eggLog.date,
            //   format(pastDate, "yyyy-MM-dd"),
            //   format(today, "yyyy-MM-dd")
            // ),
            input.breedFilter
              ? inArray(eggLog.breedId, input.breedFilter)
              : undefined,
          ),
        )
        .orderBy(({ date }) => desc(date))
        .limit(input.limit || 7);

      console.log("Get logs: ", getLogs);

      const [beginThisWeek, endThisWeek] = getThisWeek(today);

      console.log("This week: ", [beginThisWeek, endThisWeek]);

      const [thisWeeksAvg] = await ctx.db
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
        );

      // const thisWeeksAvg = await ctx.prisma.eggLog.aggregate({
      //   where: {
      //     flockId: input.flockId,
      //     date: {
      //       lte: endThisWeek,
      //       gte: beginThisWeek,
      //     },
      //   },
      //   _avg: {
      //     count: true,
      //   },
      // });

      const [beginLastWeek, endLastWeek] = getLastWeek(today);

      console.log("Last week: ", [beginLastWeek, endLastWeek]);

      const [lastWeeksAvg] = await ctx.db
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
        );

      // const lastWeeksAvg = await ctx.prisma.eggLog.aggregate({
      //   where: {
      //     flockId: input.flockId,
      //     date: {
      //       lte: endLastWeek,
      //       gte: beginLastWeek,
      //     },
      //   },
      //   _avg: {
      //     count: true,
      //   },
      // });

      console.log("This week's avg: ", thisWeeksAvg);
      console.log("Last week's avg: ", lastWeeksAvg);

      return {
        getLogs,
        thisWeeksAvg,
        lastWeeksAvg,
      };
    }),
  getExpenseStats: protectedProcedure
    .input(
      z.object({
        today: z.union([z.date(), z.string()]),
        flockId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const dates = [new Date(input.today)];

      for (let i = 1; i < 6; i++) {
        dates.push(subMonths(dates[i - 1]!, 1));
      }

      const getExp = await ctx.db
        .execute(sql`SELECT CONCAT(MONTH(expen.date), '/', YEAR(expen.date)) AS MonthYear, category as Cat, flockId, SUM(expen.amount) AS Tot
                    FROM Expense AS expen
                    WHERE YEAR(expen.date) IN (${dates[0]?.getFullYear()}, ${dates[1]?.getFullYear()}, ${dates[2]?.getFullYear()}, ${dates[3]?.getFullYear()}, ${dates[4]?.getFullYear()}, ${dates[5]?.getFullYear()}) 
                    AND MONTH(expen.date) IN (${dates[0]?.getMonth()! + 1}, ${
                      dates[1]?.getMonth()! + 1
                    }, ${dates[2]?.getMonth()! + 1}, ${
                      dates[3]?.getMonth()! + 1
                    },${dates[4]?.getMonth()! + 1}, ${
                      dates[5]?.getMonth()! + 1
                    })
                    AND expen.flockId = ${input.flockId}
                    GROUP BY flockId, MonthYear, Cat
                    ORDER BY MonthYear ASC`);

      // console.log("Get exp: ", getExp);

      const getProd = await ctx.db
        .execute(sql`SELECT CONCAT(MONTH(logs.date), '/', YEAR(logs.date)) AS MonthYear, flockId, SUM(logs.count) AS Tot
                    FROM EggLog AS logs
                    WHERE YEAR(logs.date) IN (${dates[0]?.getFullYear()}, ${dates[1]?.getFullYear()}, ${dates[2]?.getFullYear()}, ${dates[3]?.getFullYear()}, ${dates[4]?.getFullYear()}, ${dates[5]?.getFullYear()}) 
                    AND MONTH(logs.date) IN (${dates[0]?.getMonth()! + 1}, ${
                      dates[1]?.getMonth()! + 1
                    }, ${dates[2]?.getMonth()! + 1}, ${
                      dates[3]?.getMonth()! + 1
                    },${dates[4]?.getMonth()! + 1}, ${
                      dates[5]?.getMonth()! + 1
                    })
                    AND logs.flockId = ${input.flockId}
                    GROUP BY flockId, MonthYear
                    ORDER BY MonthYear ASC`);

      // console.log("Get prod: ", getProd);

      return {
        expenses: getExp.rows,
        production: getProd.rows,
      };
    }),
  getFlockSummary: protectedProcedure
    .input(
      z.object({ flockId: z.string(), month: z.string(), year: z.string() }),
    )
    .query(async ({ input, ctx }) => {
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
      var today = new Date(input.today);
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
