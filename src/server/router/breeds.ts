import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const breedssRouter = createProtectedRouter()
  .query("getBreeds", {
    async resolve({ input, ctx }) {
      return await ctx.prisma.flock.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          breeds: true,
        },
      });
    },
  })
  .mutation("createBreed", {
    input: z.object({
      name: z.string(),
      description: z.string().optional(),
      count: z.number(),
      averageProduction: z.number(),
      imageUrl: z.string().optional(),
      flockId: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.breed.create({
        data: input,
      });
    },
  })
  .mutation("updateBreed", {
    input: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      count: z.number(),
      averageProduction: z.number(),
      imageUrl: z.string(),
      flockId: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.breed.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
          count: input.count,
          imageUrl: input.imageUrl ? input.imageUrl : "",
          averageProduction: input.averageProduction,
          flockId: input.flockId,
        },
      });
    },
  })
  .mutation("deleteBreed", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.breed.delete({
        where: {
          id: input.id,
        },
      });
    },
  });
