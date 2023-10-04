import { expense } from "@lib/db/schema";
import cuid from "cuid";
import { eq } from "drizzle-orm";
import { fetchExpenses } from "src/app/app/expenses/page";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { formatDateForMySQL } from "./logs";

export const expensesRouter = router({
  getExpenses: protectedProcedure
    .input(z.object({ page: z.number() }))
    .query(async ({ input, ctx }) => {
      const expenses = await fetchExpenses(ctx.session.user.id, input.page);

      return expenses;
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
      const id: string = cuid();
      return await ctx.db.insert(expense).values([
        {
          id,
          ...input,
          date: formatDateForMySQL(input.date),
        },
      ]);
    }),
  deleteExpense: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.delete(expense).where(eq(expense.id, input.id));
    }),
});
