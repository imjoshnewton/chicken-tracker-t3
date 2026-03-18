import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import * as tasksService from "../../../services/tasks.service";

export const tasksRouter = router({
  markComplete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        recurrence: z.string().default(""),
      })
    )
    .mutation(async ({ input }) => {
      return tasksService.markTaskAsComplete(input.id, input.recurrence);
    }),
  updateTask: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().default(""),
        dueDate: z.date(),
        recurrence: z.string().default(""),
        status: z.string().default("Incomplete"),
        completed: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      return tasksService.updateTask(input);
    }),
  deleteTask: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return tasksService.deleteTask(input.id);
    }),
});
