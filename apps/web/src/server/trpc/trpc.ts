import { user } from "@lib/db/schema-postgres";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import superjson from "superjson";

import { type Context } from "./context";
import { clerkClient } from "@clerk/nextjs/server";


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

  // Try to find user by primary or secondary Clerk ID
  const [dbUser] = await ctx.db
    .select()
    .from(user)
    .where(
      // Check both primary and secondary Clerk IDs
      sql`${user.clerkId} = ${ctx.auth.userId} OR ${user.secondaryClerkId} = ${ctx.auth.userId}`
    )
    .limit(1);

  if (!dbUser) {
    console.error(`User not found with Clerk ID: ${ctx.auth.userId}`);
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not found in database"
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
