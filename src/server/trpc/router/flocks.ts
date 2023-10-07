import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
// import { JWT } from "google-auth-library";
// import { Breed, Flock, Task } from "@prisma/client";
import { flock as Flocks, breed as Breeds, user, task } from "@lib/db/schema";
import { eq, and, not } from "drizzle-orm";
import cuid from "cuid";

export const flocksRouter = router({
  getFlock: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const flock = await ctx.db.query.flock.findFirst({
        where: eq(Flocks.id, input.flockId),
        with: {
          breeds: {
            where: eq(Breeds.deleted, 0),
            orderBy: (breeds, { asc }) => [asc(breeds.id)],
          },
        },
      });

      if (!flock) {
        throw new Error("Flock not found");
      }

      const nonRecurring = (
        await ctx.db
          .select()
          .from(task)
          .where(and(eq(task.flockId, input.flockId), eq(task.recurrence, "")))
      ).map((task) => {
        return {
          ...task,
          completed: task.completed === 1,
          dueDate: task.dueDate === null ? null : new Date(task.dueDate),
        };
      });

      const recurring = (
        await ctx.db
          .select()
          .from(task)
          .where(
            and(eq(task.flockId, input.flockId), not(eq(task.recurrence, "")))
          )
      ).map((task) => {
        return {
          ...task,
          completed: task.completed === 1,
          dueDate: task.dueDate === null ? null : new Date(task.dueDate),
        };
      });

      const flockWithTasks = {
        ...flock,
        deleted: flock.deleted === 1,
        // breeds: flock.breeds.map((breed) => {
        //   return {
        //     ...breed,
        //     deleted: breed.deleted === 1,
        //   };
        // }, []),
        tasks: [...nonRecurring, ...recurring].sort((a, b) => {
          if (a.completed === b.completed) {
            if (a.dueDate === null && b.dueDate === null) {
              return 0;
            } else if (a.dueDate === null) {
              return 1;
            } else if (b.dueDate === null) {
              return -1;
            } else {
              return a.dueDate.getTime() - b.dueDate.getTime();
            }
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
    return await ctx.db
      .select({
        id: Flocks.id,
        name: Flocks.name,
        description: Flocks.description,
        imageUrl: Flocks.imageUrl,
        type: Flocks.type,
        userId: Flocks.userId,
      })
      .from(user)
      .where(eq(user.id, ctx.session.user.id))
      .innerJoin(Flocks, eq(Flocks.userId, user.id));
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
      const id = cuid();

      return await ctx.db.insert(Flocks).values([
        {
          ...input,
          id: id,
          imageUrl: input.imageUrl ? input.imageUrl : "",
          userId: ctx.session.user.id,
        },
      ]);
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
      const flockRes = await ctx.db
        .update(Flocks)
        .set({
          ...input,
          imageUrl: input.imageUrl ? input.imageUrl : "",
        })
        .where(eq(Flocks.id, input.id));

      return flockRes;
    }),
});
