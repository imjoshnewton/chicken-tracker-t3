import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import {
  addMonths,
  endOfDay,
  getDaysInMonth,
  getMonth,
  startOfDay,
  subDays,
  subMonths,
} from "date-fns";

export const statsRouter = router({
  getStats: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
        limit: z.number(),
        today: z.date(),
        breedFilter: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      var today = endOfDay(input.today);

      var pastDate = startOfDay(subDays(today, input.limit));

      console.log("Today: ", today);
      console.log("Past date: ", pastDate);

      const getLogs = await ctx.prisma.eggLog.groupBy({
        where: {
          flockId: input.flockId,
          date: {
            lte: today,
            gte: pastDate,
          },
          breedId: {
            in: input.breedFilter,
          },
        },
        by: ["date"],
        orderBy: {
          date: "desc",
        },
        take: input.limit || 7,
        _sum: {
          count: true,
        },
      });

      const [beginThisWeek, endThisWeek] = getThisWeek(today);

      console.log("This week: ", [beginThisWeek, endThisWeek]);

      const thisWeeksAvg = await ctx.prisma.eggLog.aggregate({
        where: {
          flockId: input.flockId,
          date: {
            lte: endThisWeek,
            gte: beginThisWeek,
          },
        },
        _avg: {
          count: true,
        },
      });

      const [beginLastWeek, endLastWeek] = getLastWeek(today);

      console.log("Last week: ", [beginLastWeek, endLastWeek]);

      const lastWeeksAvg = await ctx.prisma.eggLog.aggregate({
        where: {
          flockId: input.flockId,
          date: {
            lte: endLastWeek,
            gte: beginLastWeek,
          },
        },
        _avg: {
          count: true,
        },
      });

      return {
        getLogs,
        thisWeeksAvg,
        lastWeeksAvg,
      };
    }),
  getExpenseStats: protectedProcedure
    .input(
      z.object({
        today: z.date(),
        flockId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const dates = [input.today];

      for (let i = 1; i < 6; i++) {
        dates.push(subMonths(dates[i - 1]!, 1));
      }

      const getExpenses = await ctx.prisma
        .$queryRaw`SELECT CONCAT(MONTH(expen.date), '/', YEAR(expen.date)) AS MonthYear, category as Cat, flockId, SUM(expen.amount) AS Tot
                    FROM Expense AS expen
                    WHERE YEAR(expen.date) IN (${dates[0]?.getFullYear()}, ${dates[1]?.getFullYear()}, ${dates[2]?.getFullYear()}, ${dates[3]?.getFullYear()}, ${dates[4]?.getFullYear()}, ${dates[5]?.getFullYear()}) 
                    AND MONTH(expen.date) IN (${dates[0]?.getMonth()! + 1}, ${
        dates[1]?.getMonth()! + 1
      }, ${dates[2]?.getMonth()! + 1}, ${dates[3]?.getMonth()! + 1},${
        dates[4]?.getMonth()! + 1
      }, ${dates[5]?.getMonth()! + 1})
                    AND expen.flockId = ${input.flockId}
                    GROUP BY flockId, MonthYear, Cat
                    ORDER BY MonthYear ASC`;

      const getProduction = await ctx.prisma
        .$queryRaw`SELECT CONCAT(MONTH(logs.date), '/', YEAR(logs.date)) AS MonthYear, flockId, SUM(logs.count) AS Tot
                    FROM EggLog AS logs
                    WHERE YEAR(logs.date) IN (${dates[0]?.getFullYear()}, ${dates[1]?.getFullYear()}, ${dates[2]?.getFullYear()}, ${dates[3]?.getFullYear()}, ${dates[4]?.getFullYear()}, ${dates[5]?.getFullYear()}) 
                    AND MONTH(logs.date) IN (${dates[0]?.getMonth()! + 1}, ${
        dates[1]?.getMonth()! + 1
      }, ${dates[2]?.getMonth()! + 1}, ${dates[3]?.getMonth()! + 1},${
        dates[4]?.getMonth()! + 1
      }, ${dates[5]?.getMonth()! + 1})
                    AND logs.flockId = ${input.flockId}
                    GROUP BY flockId, MonthYear
                    ORDER BY MonthYear ASC`;

      return {
        expenses: getExpenses,
        production: getProduction,
      };
    }),
  getFlockSummary: protectedProcedure
    .input(
      z.object({ flockId: z.string(), month: z.string(), year: z.string() })
    )
    .query(async ({ input, ctx }) => {
      const startOfMonth = new Date(`${input.month}/01/${input.year}`);
      const startOfNextMonth = addMonths(startOfMonth, 1);

      console.log("Start of this month: ", startOfMonth);
      console.log("Start of next month: ", startOfNextMonth);

      const flockData = await ctx.prisma.flock.findUniqueOrThrow({
        where: {
          id: input.flockId,
        },
        include: {
          breeds: true,
        },
      });

      const expenseData = await ctx.prisma.expense.groupBy({
        where: {
          flockId: input.flockId,
          date: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },
        by: ["category"],
        _sum: {
          amount: true,
        },
      });

      const logData = await ctx.prisma.eggLog.aggregate({
        where: {
          flockId: input.flockId,
          date: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },
        _avg: {
          count: true,
        },
        _sum: {
          count: true,
        },
        _max: {
          count: true,
        },
        _count: {
          id: true,
        },
      });

      const totalExpenses = expenseData
        .map((exp) => exp._sum.amount ?? 0)
        .reduce((acc, cur) => acc + cur);

      return {
        flock: {
          id: flockData.id,
          name: flockData.name,
          image: flockData.imageUrl,
        },
        expenses: {
          total: totalExpenses,
          categories: expenseData,
        },
        logs: {
          total: logData._sum.count,
          numLogs: logData._count.id,
          average: logData._avg.count,
          calcAvg: (logData._sum.count ?? 0) / getDaysInMonth(startOfMonth),
          largest: logData._max.count,
        },
        year: startOfMonth.toLocaleString("default", { year: "numeric" }),
        month: startOfMonth.toLocaleString("default", { month: "long" }),
      };
    }),
  getBreedStats: protectedProcedure
    .input(z.object({ today: z.date(), flockId: z.string() }))
    .query(async ({ input, ctx }) => {
      var today = input.today;
      today.setHours(23, 59, 59, 999);

      const [beginThisWeek, endThisWeek] = getThisWeek(today);

      return await ctx.prisma.eggLog.groupBy({
        where: {
          flockId: input.flockId,
          date: {
            lte: endThisWeek,
            gte: beginThisWeek,
          },
        },
        _avg: {
          count: true,
        },
        by: ["breedId"],
        orderBy: {
          _avg: {
            count: "desc",
          },
        },
        // take: 1,
      });
    }),
});

function getThisWeek(today: Date): [beginningofWeek: Date, endofWeek: Date] {
  //   const today = admin.firestore.Timestamp.now().toDate();
  today.setHours(0, 0, 0, 0);
  let tempDate = new Date(today);
  const dayOfWeek = today.getDay();
  const endOfWeek = new Date(
    tempDate.setDate(tempDate.getDate() + (6 - dayOfWeek))
  );
  endOfWeek.setHours(23, 59, 59, 999);
  tempDate = new Date(today);
  const beginningOfWeek = new Date(
    tempDate.setDate(tempDate.getDate() - dayOfWeek)
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
    tempDate.setDate(tempDate.getDate() + (6 - dayOfWeek))
  );
  endOfWeek.setHours(23, 59, 59, 999);
  tempDate = new Date(dayLastWeek);
  const beginningOfWeek = new Date(
    tempDate.setDate(tempDate.getDate() - dayOfWeek)
  );

  return [beginningOfWeek, endOfWeek];
}
