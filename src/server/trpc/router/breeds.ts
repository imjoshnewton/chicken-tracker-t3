import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import * as breedsService from "../../../services/breeds.service";

export const breedsRouter = router({
  createBreed: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        breed: z.string(),
        description: z.string().optional(),
        count: z.number(),
        averageProduction: z.number(),
        imageUrl: z.string().optional(),
        flockId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return breedsService.createBreed(input);
    }),
  updateBreed: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().nullish(),
        breed: z.string(),
        description: z.string(),
        count: z.number(),
        averageProduction: z.number(),
        imageUrl: z.string(),
        flockId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return breedsService.updateBreed(input);
    }),
  deleteBreed: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return breedsService.deleteBreed(input.id);
    }),
});
