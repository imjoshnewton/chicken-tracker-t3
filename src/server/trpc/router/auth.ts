import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.auth;
  }),
  getUser: protectedProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.user.findFirstOrThrow({
        where: {
          clerkId: input.clerkId,
        },
      });
    }),
  updateUser: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        image: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name,
          image: input.image,
        },
      });
    }),
  setDefaultFlock: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          defaultFlock: input.flockId,
        },
      });
    }),
  getUserNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.notification.findMany({
      where: {
        userId: ctx.session.user.id,
        // read: false,
      },
      orderBy: {
        date: "desc",
      },
      take: 10,
    });
  }),
  getUserUnreadNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.notification.findMany({
      where: {
        userId: ctx.session.user.id,
        read: false,
      },
      orderBy: {
        date: "desc",
      },
      take: 10,
    });
  }),
  markNotificationasRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.notification.update({
        where: {
          id: input.id,
        },
        data: {
          read: true,
        },
      });
    }),
});
