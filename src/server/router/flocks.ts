import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const flocksRouter = createProtectedRouter()
    .query("getFlock", {
        input: z
            .object({
                flockId: z.string().nullish(),
                limit: z.number().nullish(),
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
                        logs: {
                            orderBy: {
                                date: 'desc'
                            },
                            take: input.limit || 7
                        },
                    }
                });
            }
            else {
                return null;
            }
        },
    })
    .query("getFlocks", {
        async resolve({ input, ctx }) {
            if (ctx.session?.user) {
                return await ctx.prisma.flock.findMany({
                    where: {
                        userId: ctx.session.user.id
                    }
                });
            }
            else {
                return null;
            }
        },
    })
    .query("getLogs", {
        async resolve({ input, ctx }) {
            return await ctx.prisma.flock.findMany({
                where: {
                    userId: ctx.session.user.id
                },
                include: {
                    logs: {
                        orderBy: {
                            date: 'desc'
                        }
                    }
                }
            });
        }
    })
    .mutation('createLog', {
        input: z
            .object({
                flockId: z.string(),
                date: z.date(),
                count: z.number(),
                notes: z.string().optional(),
            }),
        async resolve({ input, ctx }) {
            return await ctx.prisma.log.create({
                data: input,
            })
        }
    })
    .mutation('deleteLog', {
        input: z
            .object({
                id: z.string(),
            }),
        async resolve({ input, ctx }) {
            return await ctx.prisma.log.delete({
                where: {
                    id: input.id
                }
            })
        }
    })
