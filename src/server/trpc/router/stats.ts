import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import * as statsService from "../../../services/stats.service";

export const statsRouter = router({
  getStats: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
        range: z.object({
          from: z.date(),
          to: z.date(),
        }),
        today: z.union([z.date(), z.string()]),
        breedFilter: z.array(z.string()).nullable().optional(),
      }),
    )
    .query(async ({ input }) => {
      return statsService.getStats({
        flockId: input.flockId,
        range: input.range,
        today: input.today,
        breedFilter: input.breedFilter,
      });
    }),
  getExpenseStats: protectedProcedure
    .input(
      z.object({
        today: z.union([z.date(), z.string()]),
        flockId: z.string(),
        numMonths: z.number().default(6),
      }),
    )
    .query(async ({ input }) => {
      return statsService.getExpenseStats({
        today: input.today,
        flockId: input.flockId,
        numMonths: input.numMonths,
      });
    }),
  getFlockSummary: protectedProcedure
    .input(
      z.object({ flockId: z.string(), month: z.string(), year: z.string() }),
    )
    .query(async ({ input }) => {
      return statsService.getFlockSummary({
        flockId: input.flockId,
        month: input.month,
        year: input.year,
      });
    }),
  getBreedStats: protectedProcedure
    .input(
      z.object({ today: z.union([z.date(), z.string()]), flockId: z.string() }),
    )
    .query(async ({ input }) => {
      return statsService.getBreedStats({
        today: input.today,
        flockId: input.flockId,
      });
    }),
});
