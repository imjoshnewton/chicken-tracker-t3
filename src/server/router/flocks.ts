import { Flock } from "@prisma/client";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const flocksRouter = createProtectedRouter()
  .query("getFlock", {
    input: z.object({
      flockId: z.string().nullish(),
    }),
    async resolve({ input, ctx }) {
      if (input?.flockId && ctx.session?.user?.id) {
        return await ctx.prisma.flock.findFirst({
          where: {
            id: input.flockId,
            userId: ctx.session.user.id,
          },
          include: {
            breeds: true,
          },
        });
      } else {
        return null;
      }
    },
  })
  .query("getFlocks", {
    async resolve({ input, ctx }) {
      if (ctx.session?.user) {
        return await ctx.prisma.flock.findMany({
          where: {
            userId: ctx.session.user.id,
          },
        });
      } else {
        return null;
      }
    },
  })
  .query("getLogs", {
    async resolve({ input, ctx }) {
      return await ctx.prisma.flock.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          logs: {
            orderBy: {
              date: "desc",
            },
          },
        },
      });
    },
  })
  .query("getExpenses", {
    async resolve({ input, ctx }) {
      return await ctx.prisma.flock.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          expenses: {
            orderBy: {
              date: "desc",
            },
          },
        },
      });
    },
  })
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

        const getLogs = await ctx.prisma.log.groupBy({
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

        const thisWeeksAvg = await ctx.prisma.log.aggregate({
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

        const lastWeeksAvg = await ctx.prisma.log.aggregate({
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
  .mutation("createLog", {
    input: z.object({
      flockId: z.string(),
      date: z.date(),
      count: z.number(),
      notes: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.log.create({
        data: input,
      });
    },
  })
  .mutation("createExpense", {
    input: z.object({
      flockId: z.string(),
      date: z.date(),
      amount: z.number(),
      memo: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.expense.create({
        data: input,
      });
    },
  })
  .mutation("deleteLog", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.log.delete({
        where: {
          id: input.id,
        },
      });
    },
  })
  .mutation("deleteExpense", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.expense.delete({
        where: {
          id: input.id,
        },
      });
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
