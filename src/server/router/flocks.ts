import { z } from "zod";
import { createProtectedRouter } from "./protected-router";
import { JWT } from "google-auth-library";

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

      // if (input.default) {
      //   // Send a message to cloud pubsub
      //   const msgData = {
      //     flockId: flockRes.id,
      //     ownerId: flockRes.userId,
      //   };

      //   const client = new JWT({
      //     email: process.env.GCP_CLIENT_EMAIL,
      //     key: process.env.GCP_PRIVATE_KEY,
      //     scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      //   });

      //   const dataBuffer = Buffer.from(JSON.stringify(msgData)).toString(
      //     "base64"
      //   );

      //   const url =
      //     "https://pubsub.googleapis.com/v1/projects/chicken-tracker-83ef8/topics/defaultFlock:publish";

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

      // const response = await client.request({
      //   url: url,
      //   method: "POST",
      //   data: {
      //     messages: [
      //       {
      //         data: dataBuffer,
      //       },
      //     ],
      //   },
      // });
      // console.log(response);

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
      // }

      return flockRes;
    },
  });

// const topicName = "test-topic";

// module.exports.publisher = async (event) => {
//   console.log(event.body);
//   const dataBuffer = Buffer.from(event.body).toString("base64");
//   const url = `https://pubsub.googleapis.com/v1/${topicName}:publish`;
//   const options = {
//     url: url,
//     method: "POST",
//     data: {
//       messages: [
//         {
//           data: dataBuffer,
//         },
//       ],
//     },
//   };
//   const res = await client.request(options);
//   console.log(res.data);
//   return res.data;
// };
