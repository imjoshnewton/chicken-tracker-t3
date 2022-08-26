import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const logsRouter = createProtectedRouter()
  .query("getLogs", {
    async resolve({ input, ctx }) {
      return await ctx.prisma.flock.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          logs: {
            orderBy: {
              date: "desc",
            },
          },
        },
      });
    },
  })
  .mutation("createLog", {
    input: z.object({
      flockId: z.string(),
      date: z.date(),
      count: z.number(),
      notes: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.eggLog.create({
        data: input,
      });
    },
  })
  .mutation("deleteLog", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.eggLog.delete({
        where: {
          id: input.id,
        },
      });
    },
  });
