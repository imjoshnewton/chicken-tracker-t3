import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const logsRouter = router({
  getLogs: protectedProcedure.query(async ({ ctx }) => {
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
  }),
  createLog: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
        date: z.date(),
        count: z.number(),
        breedId: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.eggLog.create({
        data: input,
      });
    }),
  deleteLog: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.eggLog.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
