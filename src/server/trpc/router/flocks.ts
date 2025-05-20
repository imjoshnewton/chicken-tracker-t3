import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
// import { JWT } from "google-auth-library";
// import { Breed, Flock, Task } from "@prisma/client";
import {
  flock as Flocks,
  breed as Breeds,
  user,
  task,
  flock,
} from "@lib/db/schema-postgres";
import { eq, and, not } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { executeWithRetry, withTransaction } from "@lib/db/utils";

export const flocksRouter = router({
  getFlock: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Use executeWithRetry for better error handling and stability in serverless
      return executeWithRetry(async () => {
        // Get all required data in a single query to avoid N+1 problems
        // This consolidates what were previously three separate database trips
        const [flockData, taskData] = await Promise.all([
          // Get flock with breeds
          ctx.db.query.flock.findFirst({
            where: eq(Flocks.id, input.flockId),
            with: {
              breeds: {
                where: eq(Breeds.deleted, false),
                orderBy: (breeds, { asc }) => [asc(breeds.id)],
              },
            },
          }),
          
          // Get all tasks in a single query instead of two separate ones
          ctx.db
            .select()
            .from(task)
            .where(eq(task.flockId, input.flockId))
        ]);
        
        if (!flockData) {
          throw new Error("Flock not found");
        }
        
        // Process tasks locally instead of in separate queries
        const nonRecurring = taskData
          .filter(t => t.recurrence === "")
          .map(task => ({
            ...task,
            completed: task.completed,
            dueDate: task.dueDate,
          }));
          
        const recurring = taskData
          .filter(t => t.recurrence !== "")
          .map(task => ({
            ...task,
            completed: task.completed,
            dueDate: task.dueDate,
          }));
          
        const flockWithTasks = {
          ...flockData,
          deleted: flockData.deleted,
          breeds: flockData.breeds.map((breed) => {
            return {
              ...breed,
              deleted: breed.deleted,
            };
          }, []),
          tasks: [...nonRecurring, ...recurring].sort((a, b) => {
            if (a.completed === b.completed) {
              if (a.dueDate === null && b.dueDate === null) {
                return 0;
              } else if (a.dueDate === null) {
                return 1;
              } else if (b.dueDate === null) {
                return -1;
              } else {
                return (
                  new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                );
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
      }, {
        maxRetries: 3,
        operation: "Get flock data"
      });
    }),
  getFlocks: protectedProcedure.query(async ({ ctx }) => {
    return executeWithRetry(async () => {
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
    }, {
      maxRetries: 2,
      operation: "Get all flocks"
    });
  }),
  createFlock: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        type: z.string(),
        imageUrl: z.string().nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const id = createId();
      
      // Use transaction to ensure data consistency and retry logic for reliability in serverless
      return withTransaction(async (tx) => {
        const flock = await tx.insert(Flocks).values([
          {
            ...input,
            id: id,
            imageUrl: input.imageUrl ? input.imageUrl : "",
            userId: ctx.session.user.id,
          },
        ]);
        
        return flock;
      }, {
        maxRetries: 3,
        operation: "Create flock"
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
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Use transaction to ensure data consistency and retry logic
      return withTransaction(async (tx) => {
        const flockRes = await tx
          .update(Flocks)
          .set({
            ...input,
            imageUrl: input.imageUrl ? input.imageUrl : "",
          })
          .where(eq(Flocks.id, input.id));
  
        return flockRes;
      }, {
        maxRetries: 3,
        operation: "Update flock"
      });
    }),
});
