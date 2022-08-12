import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const flocksRouter = createProtectedRouter()
    .query("getFlock", {
        input: z
            .object({
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
    .query("getExpenses", {
        async resolve({ input, ctx }) {
            return await ctx.prisma.flock.findMany({
                where: {
                    userId: ctx.session.user.id
                },
                include: {
                    expenses: {
                        orderBy: {
                            date: 'desc'
                        }
                    }
                }
            });
        }
    })
    .query("getStatLogs", {
        input: z
            .object({
                flockId: z.string().nullish(),
                limit: z.number().nullish(),
                today: z.date().nullish(),
            }),
        async resolve({ input, ctx }) {
            if(input.flockId && input.limit) {
                var today = new Date(Date.now())
                var pastDate = new Date(today);
                pastDate.setDate(pastDate.getDate() - input.limit);

                console.log("Today: ", today);
                console.log("Past Date: ", pastDate);

                return await ctx.prisma.log.groupBy({
                    where: {
                        flockId: input.flockId,
                        date: {
                            lte: today,
                            gte: pastDate
                        }
                    },
                    by: ['date'],
                    orderBy: {
                        date: 'desc'
                    },
                    take: input.limit || 7,
                    _sum: {
                        count: true
                    }
                });
            }
            else {
                return null;
            }
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
    .mutation('createExpense', {
        input: z
            .object({
                flockId: z.string(),
                date: z.date(),
                amount: z.number(),
                memo: z.string().optional(),
            }),
        async resolve({ input, ctx }) {
            return await ctx.prisma.expense.create({
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
    .mutation('deleteExpense', {
        input: z
            .object({
                id: z.string(),
            }),
        async resolve({ input, ctx }) {
            return await ctx.prisma.expense.delete({
                where: {
                    id: input.id
                }
            })
        }
    })
