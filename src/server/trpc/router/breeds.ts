import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

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
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.breed.create({
        data: input,
      });
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
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.breed.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name ? input.name : "",
          breed: input.breed,
          description: input.description ? input.description : "",
          count: input.count,
          imageUrl: input.imageUrl ? input.imageUrl : "",
          averageProduction: input.averageProduction,
          flockId: input.flockId,
        },
      });
    }),
  deleteBreed: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.breed.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
