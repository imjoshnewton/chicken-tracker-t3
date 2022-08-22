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
  .mutation("setDefaultFlock", {
    input: z
      .object({
        userId: z.string(),
        flockId: z.string(),
      })
      .nullish(),
    async resolve({ input, ctx }) {
      if ((input?.userId, input?.flockId)) {
        return await ctx.prisma.user.update({
          where: {
            id: input?.userId,
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
