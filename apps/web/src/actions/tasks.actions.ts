"use server";

import * as tasksService from "../services/tasks.service";
import { revalidatePath } from "next/cache";

export async function createNewTask(input: {
  title: string;
  description: string;
  dueDate: Date;
  recurrence: string;
  flockId: string;
  userId: string;
}) {
  const result = await tasksService.createTask(input);
  if (!result) {
    throw new Error("Could not create task.");
  }
  revalidatePath(`/app/tasks`);
  return result;
}

export async function deleteTask(input: { taskId: string }) {
  const result = await tasksService.deleteTask(input.taskId);
  revalidatePath(`/app/tasks`);
  return result;
}

export async function updateTask(input: {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  recurrence: string;
  status: string;
  completed: boolean;
}) {
  const result = await tasksService.updateTask(input);
  if (!result) {
    throw new Error("Could not update task.");
  }
  revalidatePath(`/app/tasks`);
  return result;
}

export async function markTaskAsComplete(input: {
  taskId: string;
  recurrence: string;
}) {
  const result = await tasksService.markTaskAsComplete(input.taskId, input.recurrence);
  revalidatePath(`/app/tasks`);
  return result;
}
