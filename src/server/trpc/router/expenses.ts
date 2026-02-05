import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import * as expensesService from "../../../services/expenses.service";

export const expensesRouter = router({
  getExpenses: protectedProcedure
    .input(z.object({ page: z.number() }))
    .query(async ({ input, ctx }) => {
      const [expenses] = await expensesService.getExpenses(ctx.session.user.id, input.page);
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
      }),
    )
    .mutation(async ({ input }) => {
      return expensesService.createExpense(input);
    }),
  deleteExpense: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return expensesService.deleteExpense(input.id);
    }),
});
