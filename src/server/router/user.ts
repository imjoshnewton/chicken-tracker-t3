import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const userRouter = createProtectedRouter()
  .query("getUser", {
    input: z
      .object({
        userId: z.string().nullish(),
      })
      .nullish(),
    async resolve({ input, ctx }) {
      if (input?.userId) {
        return await ctx.prisma.user.findUnique({
          where: {
            id: input?.userId,
          },
        });
      } else {
        return null;
      }
    },
  })
  .mutation("updateUser", {
    input: z
      .object({
        name: z.string(),
        image: z.string(),
      })
      .nullish(),
    async resolve({ input, ctx }) {
      if (input) {
        return await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            name: input.name,
            image: input.image,
          },
        });
      } else {
        return null;
      }
    },
  })
  .mutation("setDefaultFlock", {
    input: z
      .object({
        flockId: z.string(),
      })
      .nullish(),
    async resolve({ input, ctx }) {
      if (input?.flockId) {
        return await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            defaultFlock: input.flockId,
          },
        });
      } else {
        return null;
      }
    },
  });
