import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { JWT } from "google-auth-library";
import { Breed, Flock, Task } from "@prisma/client";

export const flocksRouter = router({
  getFlock: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const flock = await ctx.prisma.flock.findFirstOrThrow({
        where: {
          id: input.flockId,
          userId: ctx.session.user.id,
        },
        include: {
          breeds: {
            where: {
              deleted: false,
            },
            orderBy: {
              // name: "asc",
              breed: "asc",
            },
          },
        },
      });

      const nonRecurring = await ctx.prisma.task.findMany({
        where: {
          flockId: input.flockId,
          recurrence: "",
        },
      });

      const recurring = await ctx.prisma.task.findMany({
        where: {
          flockId: input.flockId,
          recurrence: {
            not: "",
          },
        },
      });

      const flockWithTasks: Flock & {
        breeds: Breed[];
        tasks: Task[];
      } = {
        ...flock,
        tasks: [...nonRecurring, ...recurring].sort((a, b) => {
          if (a.completed === b.completed) {
            return b.dueDate.getTime() - a.dueDate.getTime();
          } else {
            if (a.completed) {
              return 1;
            } else {
              return -1;
            }
          }
        }),
      };

      return flockWithTasks;
    }),
  getFlocks: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.flock.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  createFlock: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        type: z.string(),
        imageUrl: z.string().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.flock.create({
        data: {
          userId: ctx.session.user.id,
          name: input.name,
          description: input.description,
          type: input.type,
          imageUrl: input.imageUrl ? input.imageUrl : "",
        },
      });
    }),
  updateFlock: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        type: z.string(),
        imageUrl: z.string().nullable(),
        default: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
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

        console.log("Private Key: ", JSON.parse(process.env.GCP_PRIVATE_KEY!));

        const client = new JWT({
          email: process.env.GCP_CLIENT_EMAIL,
          key: JSON.parse(process.env.GCP_PRIVATE_KEY!),

          scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        });

        const dataBuffer = Buffer.from(JSON.stringify(msgData)).toString(
          "base64"
        );

        const url =
          "https://pubsub.googleapis.com/v1/projects/chicken-tracker-83ef8/topics/defaultFlock:publish";

        // console.log("Client: ", client);
        console.log("Data: ", dataBuffer);

        // const options = {
        //   url: url,
        //   method: "POST",
        //   data: {
        //     messages: [
        //       {
        //         data: dataBuffer,
        //       },
        //     ],
        //   },
        // };

        const response = await client.request({
          url: url,
          method: "POST",
          data: {
            messages: [
              {
                data: dataBuffer,
              },
            ],
          },
        });

        console.log(response);

        // const response = await fetch(url, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     messages: [
        //       {
        //         data: Buffer.from(JSON.stringify(msgData)).toString("base64"),
        //       },
        //     ],
        //   }),
        // });

        // console.log("Test MSG Data: ", response);
      }

      return flockRes;
    }),
});
