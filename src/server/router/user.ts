import { createRouter } from "./context";
import { z } from "zod";

export const userRouter = createRouter()
    .query("getUser", {
        input: z
            .object({
                userId: z.string().nullish(),
            })
            .nullish(),
        async resolve({ input, ctx }) {
            if(input?.userId) {
                return await ctx.prisma.user.findUnique({
                    where: {
                        id: input?.userId
                    }
                });
            }
            else {
                return null;
            }
        },
    })
