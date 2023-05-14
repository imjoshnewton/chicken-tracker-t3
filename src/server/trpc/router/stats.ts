import { addDays, subMonths, startOfWeek, endOfWeek, lastDayOfWeek, subWeeks, addWeeks } from "date-fns";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

// Helper function for getting the average count for a given week
async function getAverage(ctx: any, flockId: string, start: Date, end: Date) {
  return await ctx.prisma.eggLog.aggregate({
    where: {
      flockId: flockId,
      date: {
        lte: end,
        gte: start,
      },
    },
    _avg: {
      count: true,
    },
  });
}

// Helper function for getting monthly stats
async function getMonthlyStats(ctx: any, table: string, alias: string, column: string, flockId: string, dates: Date[]) {
  const yearMonths = dates.map(date => ({
    year: date.getFullYear(),
    month: date.getMonth() + 1, // JavaScript months are 0-based
  }));

  const query = `
    SELECT CONCAT(MONTH(${alias}.date), '/', YEAR(${alias}.date)) AS MonthYear,
           ${alias}.flockId,
           SUM(${alias}.${column}) AS Tot
    FROM ${table} AS ${alias}
    WHERE (${yearMonths.map(({ year, month }, i) => `(YEAR(${alias}.date) = ${year} AND MONTH(${alias}.date) = ${month})`).join(' OR ')})
          AND ${alias}.flockId = ${flockId}
    GROUP BY ${alias}.flockId, MonthYear
    ORDER BY MonthYear ASC
  `;

  return await ctx.prisma.$queryRawUnsafe(query);
}








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
    const today = addDays(input.today, 1);
    const pastDate = addDays(input.today, -input.limit);
  
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

    const beginThisWeek = startOfWeek(input.today, { weekStartsOn: 1 });
    const endThisWeek = endOfWeek(input.today, { weekStartsOn: 1 });

    const thisWeeksAvg = await getAverage(ctx, input.flockId, beginThisWeek, endThisWeek);

    const beginLastWeek = subWeeks(beginThisWeek, 1);
    const endLastWeek = subWeeks(endThisWeek, 1);

    const lastWeeksAvg = await getAverage(ctx, input.flockId, beginLastWeek, endLastWeek);

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
        const dates = Array.from({ length: 6 }, (_, i) => subMonths(input.today, i));
    
    const getExpenses = await getMonthlyStats(ctx, 'Expense', 'expen', 'amount', input.flockId, dates);

    const getProduction = await getMonthlyStats(ctx, 'EggLog', 'logs', 'count', input.flockId, dates);

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
