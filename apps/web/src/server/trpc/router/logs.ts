import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import * as logsService from "../../../services/logs.service";

export const logsRouter = router({
  getLogs: protectedProcedure
    .input(z.object({ page: z.number() }))
    .query(async ({ input, ctx }) => {
      const [logs] = await logsService.getLogs(ctx.session.user.id, input.page);
      return logs;
    }),
  getLogsByFlock: protectedProcedure
    .input(z.object({ page: z.number(), flockId: z.string() }))
    .query(async ({ input, ctx }) => {
      const [logs] = await logsService.getLogs(
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
    .mutation(async ({ input }) => {
      return logsService.createLog(input);
    }),
  deleteLog: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return logsService.deleteLog(input.id);
    }),
});
