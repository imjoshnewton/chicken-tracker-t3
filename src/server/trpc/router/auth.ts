import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { notification, user } from "@lib/db/schema-postgres";
import { eq, desc, and, sql } from "drizzle-orm";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.auth;
  }),
  getUser: protectedProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ input, ctx }) => {
      // First, handle empty clerkId case
      if (!input.clerkId) {
        // If clerkId is empty, return the currently authenticated user
        return ctx.session.user;
      }
      
      // Check both primary and secondary clerkId fields
      const [dbUser] = await ctx.db
        .select()
        .from(user)
        .where(
          sql`${user.clerkId} = ${input.clerkId} OR ${user.secondaryClerkId} = ${input.clerkId}`
        )
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
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user.id) {
        throw new Error("User id not found in session");
      }
      
      return await ctx.db
        .update(user)
        .set({ name: input.name, image: input.image })
        .where(eq(user.id, ctx.session.user.id));
    }),
  setDefaultFlock: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user.id) {
        throw new Error("User id not found in session");
      }
      
      return await ctx.db
        .update(user)
        .set({ defaultFlock: input.flockId })
        .where(eq(user.id, ctx.session.user.id));
    }),
  getUserNotifications: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.id) {
      throw new Error("User id not found in session");
    }
    
    return await ctx.db
      .select()
      .from(notification)
      .limit(10)
      .orderBy(desc(notification.date))
      .where(eq(notification.userId, ctx.session.user.id));
  }),
  getUserUnreadNotifications: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.id) {
      throw new Error("User id not found in session");
    }
    
    return await ctx.db
      .select()
      .from(notification)
      .where(
        and(
          eq(notification.userId, ctx.session.user.id),
          eq(notification.read, false),
        ),
      )
      .limit(10);
  }),
  markNotificationasRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .update(notification)
        .set({ read: true })
        .where(eq(notification.id, input.id));
    }),
});
