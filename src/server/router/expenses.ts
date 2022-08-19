import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const expensesRouter = createProtectedRouter()
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
