import * as tasksRepo from "../data/tasks.repository";
import { db } from "@lib/db";
import { withTransaction } from "@lib/db/utils";
import { createId } from "@paralleldrive/cuid2";
import { addDays, addWeeks, addMonths, format } from "date-fns";

const formatDateForDB = (dateObj: Date) => {
  return format(dateObj, "yyyy-MM-dd HH:mm:ss.SSS");
};

export const createTask = async (data: {
  title: string;
  description: string;
  dueDate: Date;
  recurrence: string;
  flockId: string;
  userId: string;
}) => {
  return withTransaction(async (tx) => {
    const id = createId();
    const result = await tasksRepo.createTask(tx, {
      ...data,
      id,
      dueDate: formatDateForDB(data.dueDate),
    });
    return result[0];
  }, { maxRetries: 3, operation: "Create task" });
};

export const deleteTask = async (taskId: string) => {
  return withTransaction(async (tx) => {
    const task = await tasksRepo.getTaskById(tx, taskId);
    if (!task) throw new Error("Could not find task.");
    await tasksRepo.deleteTask(tx, taskId);
    return task;
  }, { maxRetries: 2, operation: "Delete task" });
};

export const updateTask = async (data: {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  recurrence: string;
  status: string;
  completed: boolean;
}) => {
  return withTransaction(async (tx) => {
    const result = await tasksRepo.updateTask(tx, data.id, {
      ...data,
      dueDate: formatDateForDB(data.dueDate),
    });
    return result[0];
  }, { maxRetries: 2, operation: "Update task" });
};

export const markTaskAsComplete = async (taskId: string, recurrence: string) => {
  return withTransaction(async (tx) => {
    const [completedTask] = await tasksRepo.markTaskComplete(tx, taskId);
    if (!completedTask) throw new Error("Could not find task.");

    if (recurrence !== "") {
      const id = createId();
      let newDueDate: Date;
      switch (recurrence) {
        case "daily":
          newDueDate = addDays(new Date(completedTask.dueDate), 1);
          break;
        case "weekly":
          newDueDate = addWeeks(new Date(completedTask.dueDate), 1);
          break;
        case "monthly":
          newDueDate = addMonths(new Date(completedTask.dueDate), 1);
          break;
        default:
          newDueDate = new Date(completedTask.dueDate);
      }

      await tasksRepo.createTask(tx, {
        id,
        title: completedTask.title,
        description: completedTask.description,
        dueDate: formatDateForDB(newDueDate),
        recurrence: completedTask.recurrence,
        flockId: completedTask.flockId,
        userId: completedTask.userId,
      });
    }

    return completedTask;
  }, { maxRetries: 3, operation: "Mark task as complete" });
};
