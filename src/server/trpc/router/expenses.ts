import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const expensesRouter = router({
  getExpenses: protectedProcedure.query(async ({ ctx }) => {
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
  }),
  createExpense: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
        date: z.date(),
        amount: z.number(),
        memo: z.string().optional(),
        category: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.expense.create({
        data: input,
      });
    }),
  deleteExpense: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.expense.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
