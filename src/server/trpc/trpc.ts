import { user } from "@lib/db/schema";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import superjson from "superjson";

import { type Context } from "./context";
import { clerkClient } from "@clerk/nextjs";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;

/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure;

/**
 * Reusable middleware to ensure
 * users are logged in
 */
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // console.log(ctx.auth);
  // const clerkUser = ctx.auth.userId
  //   ? await clerkClient.users.getUser(ctx.auth.userId)
  //   : null;
  //
  // const primaryEmail = clerkUser?.emailAddresses.find(
  //   (email) => email.id === clerkUser.primaryEmailAddressId,
  // );
  //
  // console.log(primaryEmail);
  //
  // if (!primaryEmail) {
  //   throw new TRPCError({
  //     code: "UNAUTHORIZED",
  //   });
  // }
  //
  console.log(ctx.auth.userId);

  const [dbUser] = await ctx.db
    .select()
    .from(user)
    .where(eq(user.clerkId, ctx.auth.userId))
    .limit(1);

  if (!dbUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: {
        ...ctx.auth,
        user: dbUser,
      },
    },
  });
});

/**
 * Protected procedure
 **/
export const protectedProcedure = t.procedure.use(isAuthed);
