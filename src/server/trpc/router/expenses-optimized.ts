import { expense } from "@lib/db/schema-postgres";
import { fetchExpenses } from "@lib/fetch-optimized";
import { executeWithRetry, withTransaction } from "@lib/db/utils";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { formatDateForMySQL } from "./logs-optimized";

export const expensesRouter = router({
  getExpenses: protectedProcedure
    .input(z.object({ page: z.number() }))
    .query(async ({ input, ctx }) => {
      const [expenses] = await fetchExpenses(ctx.session.user.id, input.page);
      return expenses;
    }),
    
  getExpensesByFlock: protectedProcedure
    .input(z.object({ page: z.number(), flockId: z.string() }))
    .query(async ({ input, ctx }) => {
      const [expenses] = await fetchExpenses(
        ctx.session.user.id,
        input.page,
        input.flockId,
      );
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
    .mutation(async ({ input, ctx }) => {
      const id: string = createId();
      
      // Use transaction for data consistency
      return withTransaction(async (tx) => {
        return await tx.insert(expense).values([
          {
            id,
            ...input,
            date: formatDateForMySQL(input.date),
          },
        ]);
      }, {
        maxRetries: 3,
        operation: "Create expense"
      });
    }),
    
  deleteExpense: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Use transaction for data consistency
      return withTransaction(async (tx) => {
        return await tx.delete(expense).where(eq(expense.id, input.id));
      }, {
        maxRetries: 3,
        operation: "Delete expense"
      });
    }),
});