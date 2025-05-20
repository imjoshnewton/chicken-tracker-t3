import { breed } from "@lib/db/schema-postgres";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
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
      const id = createId();

      return await ctx.db.insert(breed).values([
        {
          id,
          ...input,
        },
      ]);
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
      return await ctx.db
        .update(breed)
        .set(input)
        .where(eq(breed.id, input.id));
    }),
  deleteBreed: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .update(breed)
        .set({ deleted: true })
        .where(eq(breed.id, input.id));
    }),
});
