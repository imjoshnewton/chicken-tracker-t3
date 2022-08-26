import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const statsRouter = createProtectedRouter()
  .query("getStats", {
    input: z.object({
      flockId: z.string().nullish(),
      limit: z.number().nullish(),
      today: z.date().nullish(),
    }),
    async resolve({ input, ctx }) {
      if (input.flockId && input.limit && input.today) {
        var today = input.today;
        today.setHours(23, 59, 59, 999);

        var pastDate = new Date(today);
        pastDate.setDate(pastDate.getDate() - input.limit);
        pastDate.setHours(0, 0, 0, 0);

        const getLogs = await ctx.prisma.eggLog.groupBy({
          where: {
            flockId: input.flockId,
            date: {
              lte: today,
              gte: pastDate,
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
      } else {
        return null;
      }
    },
  })
  .query("getExpenseStats", {
    input: z.object({
      today: z.date(),
    }),
    async resolve({ input, ctx }) {
      const today = input.today;
      console.log("Before calcs: ", today.getMonth());

      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const twoMonthsAgo = new Date(oneMonthAgo);
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);

      const months = [
        today.getMonth(),
        oneMonthAgo.getMonth(),
        twoMonthsAgo.getMonth(),
      ];
      const years: number[] = [
        today.getFullYear(),
        oneMonthAgo.getFullYear(),
        twoMonthsAgo.getFullYear(),
      ];

      console.log("Months: ", months);
      console.log("Years: ", years);

      const getExpenses = await ctx.prisma
        .$queryRaw`SELECT CONCAT(MONTH(expen.date), '/', YEAR(expen.date)) AS MonthYear, category as Cat, SUM(expen.amount) AS Tot
                    FROM Expense AS expen
                    WHERE YEAR(expen.date) IN (${today.getFullYear()}, ${oneMonthAgo.getFullYear()}, ${twoMonthsAgo.getFullYear()}) AND MONTH(expen.date) IN (${
        today.getMonth() + 1
      }, ${oneMonthAgo.getMonth() + 1}, ${twoMonthsAgo.getMonth() + 1})
                    GROUP BY MonthYear, Cat
                    ORDER BY MonthYear ASC`;

      const getProduction = await ctx.prisma
        .$queryRaw`SELECT CONCAT(MONTH(logs.date), '/', YEAR(logs.date)) AS MonthYear, SUM(logs.count) AS Tot
                    FROM EggLog AS logs
                    WHERE YEAR(logs.date) IN (${today.getFullYear()}, ${oneMonthAgo.getFullYear()}, ${twoMonthsAgo.getFullYear()}) AND MONTH(logs.date) IN (${
        today.getMonth() + 1
      }, ${oneMonthAgo.getMonth() + 1}, ${twoMonthsAgo.getMonth() + 1})
                    GROUP BY MonthYear
                    ORDER BY MonthYear ASC`;

      return {
        expenses: getExpenses,
        production: getProduction,
      };
    },
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
