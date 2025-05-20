import { eggLog } from "@lib/db/schema-postgres";
import { fetchLogs } from "@lib/fetch";
import { createId } from "@paralleldrive/cuid2";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const logsRouter = router({
  getLogs: protectedProcedure
    .input(z.object({ page: z.number() }))
    .query(async ({ input, ctx }) => {
      const [logs] = await fetchLogs(ctx.session.user.id, input.page);

      return logs;
    }),
  getLogsByFlock: protectedProcedure
    .input(z.object({ page: z.number(), flockId: z.string() }))
    .query(async ({ input, ctx }) => {
      const [logs] = await fetchLogs(
        ctx.session.user.id,
        input.page,
        input.flockId,
      );

      return logs;
    }),
  createLog: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
        date: z.date(),
        count: z.number(),
        breedId: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const id: string = createId();

      return await ctx.db.insert(eggLog).values([
        {
          id,
          ...input,
          date: formatDateForMySQL(input.date),
        },
      ]);
    }),
  deleteLog: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.delete(eggLog).where(eq(eggLog.id, input.id));
    }),
});

export const formatDateForMySQL = (dateObj: Date) => {
  return format(dateObj, "yyyy-MM-dd HH:mm:ss.SSS");
};
