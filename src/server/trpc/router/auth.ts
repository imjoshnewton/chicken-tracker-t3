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
    }),
  updateUser: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        image: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .update(user)
        .set({ name: input.name, image: input.image })
        .where(eq(user.id, ctx.session.user.id));
    }),
  setDefaultFlock: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .update(user)
        .set({ defaultFlock: input.flockId })
        .where(eq(user.id, ctx.session.user.id));
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
    return await ctx.db
      .select()
      .from(notification)
      .where(eq(notification.userId, user?.id))
      .where(eq(notification.read, 0))
      .limit(10);
  }),
  markNotificationasRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .update(notification)
        .set({ read: 1 })
        .where(eq(notification.id, input.id));
    }),
});
