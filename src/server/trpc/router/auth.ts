import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { notification, user } from "@lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.auth;
  }),
  getUser: protectedProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ input, ctx }) => {
      const [dbUser] = await ctx.db
        .select()
        .from(user)
        .where(eq(user.clerkId, input.clerkId))
        .limit(1);

      if (!dbUser) {
        throw new Error("User not found");
      }

      return dbUser;
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
    return await ctx.db
      .select()
      .from(notification)
      .limit(10)
      .orderBy(desc(notification.date))
      .where(eq(notification.userId, user?.id));
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
