import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import * as flocksService from "../../../services/flocks.service";

export const flocksRouter = router({
  getFlock: protectedProcedure
    .input(
      z.object({
        flockId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { flockData, taskData } = await flocksService.getFlockWithTasks(input.flockId);

      if (!flockData) {
        throw new Error("Flock not found");
      }

      // Process tasks locally: split into non-recurring and recurring
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
    }),
  getFlocks: protectedProcedure.query(async ({ ctx }) => {
    return flocksService.getUserFlocks(ctx.session.user.id);
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
      return flocksService.createFlock({
        ...input,
        imageUrl: input.imageUrl || "",
        userId: ctx.session.user.id,
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
    .mutation(async ({ input }) => {
      const result = await flocksService.updateFlock(input.id, {
        name: input.name,
        description: input.description,
        type: input.type,
        imageUrl: input.imageUrl,
      });
      if (!result) {
        throw new Error("Flock not found");
      }
      return result;
    }),
});
