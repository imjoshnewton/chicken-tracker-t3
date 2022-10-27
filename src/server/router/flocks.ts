import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const flocksRouter = createProtectedRouter()
  .query("getFlock", {
    input: z.object({
      flockId: z.string().nullish(),
    }),
    async resolve({ input, ctx }) {
      if (input?.flockId && ctx.session?.user?.id) {
        return await ctx.prisma.flock.findFirst({
          where: {
            id: input.flockId,
            userId: ctx.session.user.id,
          },
          include: {
            breeds: true,
          },
        });
      } else {
        return null;
      }
    },
  })
  .query("getFlocks", {
    async resolve({ input, ctx }) {
      if (ctx.session?.user) {
        return await ctx.prisma.flock.findMany({
          where: {
            userId: ctx.session.user.id,
          },
        });
      } else {
        return null;
      }
    },
  })
  .mutation("createFlock", {
    input: z.object({
      name: z.string(),
      description: z.string(),
      type: z.string(),
      imageUrl: z.string().nullable(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.flock.create({
        data: {
          userId: ctx.session.user.id,
          name: input.name,
          description: input.description,
          type: input.type,
          imageUrl: input.imageUrl ? input.imageUrl : "",
        },
      });
    },
  })
  .mutation("updateFlock", {
    input: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      type: z.string(),
      imageUrl: z.string().nullable(),
      default: z.boolean().optional(),
    }),
    async resolve({ input, ctx }) {
      const flockRes = await ctx.prisma.flock.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
          type: input.type,
          imageUrl: input.imageUrl ? input.imageUrl : "",
        },
      });

      if (input.default) {
        // Send a message to cloud pubsub
        const msgData = {
          flockId: flockRes.id,
          ownerId: flockRes.userId,
        };

        console.log("Test MSG Data: ", msgData);
      }

      return flockRes;
    },
  });
