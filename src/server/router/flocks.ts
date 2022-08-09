import { createRouter } from "./context";
import { z } from "zod";

export const flocksRouter = createRouter()
    .query("getFlocks", {
        input: z
            .object({
                userId: z.string().nullish(),
            })
            .nullish(),
        async resolve({ input, ctx }) {
            if(input?.userId) {
                return await ctx.prisma.flock.findMany({
                    where: {
                        userId: input?.userId
                    }
                });
            }
            else {
                return null;
            }
        },
    })
    .query("getFlock", {
        input: z
            .object({
                // userId: z.string().nullish(),
                flockId: z.string().nullish(),
            })
            .nullish(),
        async resolve({ input, ctx }) {
            if (input?.flockId && ctx.session?.user?.id) {
                return await ctx.prisma.flock.findFirst({
                    where: {
                        id: input.flockId,
                        userId: ctx.session.user.id
                    },
                    include: {
                        breeds: true,
                        logs: true,
                    }
                });
            }
            else {
                return null;
            }
        },
    })
    .query("getLogs", {
        input: z
            .object({
                flockId: z.string().nullish(),
            })
            .nullish(),
        async resolve({ input, ctx }) {
            if (input?.flockId) {
                return await ctx.prisma.log.findMany({
                    where: {
                        flockId: input?.flockId
                    }
                });
            }
            else {
                return null;
            }
        }
    })
