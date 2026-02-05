import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import * as usersService from "../../../services/users.service";
import * as notificationsService from "../../../services/notifications.service";

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

      const dbUser = await usersService.getUserByClerkId(input.clerkId);

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

      return usersService.updateUser(ctx.session.user.id, input);
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

      return usersService.setDefaultFlock(ctx.session.user.id, input.flockId);
    }),
  getUserNotifications: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.id) {
      throw new Error("User id not found in session");
    }

    return notificationsService.getUserNotifications(ctx.session.user.id);
  }),
  getUserUnreadNotifications: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.id) {
      throw new Error("User id not found in session");
    }

    return notificationsService.getUnreadNotifications(ctx.session.user.id);
  }),
  markNotificationasRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return notificationsService.markNotificationAsRead(input.id);
    }),
});
