import { User } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { prisma } from "../db/client";

import { type Context } from "./context";

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

  const user: User = await ctx.prisma.user.findUniqueOrThrow({
    where: {
      clerkId: ctx.auth.userId,
    },
  });

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: {
        ...ctx.auth,
        user: user,
      },
    },
  });
  // console.log("UserId: ", ctx.auth.userId);

  // const user = await prisma.user.findUnique({
  //   where: {
  //     id: ctx.auth.userId ?? undefined,
  //   },
  // });

  // console.log("User: ", user);
  // console.log("Auth: ", ctx.auth);

  // if (!ctx.auth || !user) {
  //   throw new TRPCError({ code: "UNAUTHORIZED" });
  // }

  // return next({
  //   ctx: {
  //     // infers the `session` as non-nullable
  //     session: { ...ctx.auth, user: user },
  //   },
  // });
});

/**
 * Protected procedure
 **/
export const protectedProcedure = t.procedure.use(isAuthed);
