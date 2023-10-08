"use server";

import { db } from "@lib/db";
import {
  eggLog,
  expense,
  flock as Flocks,
  notification as Notifications,
  task as Tasks,
  user as Users,
} from "@lib/db/schema";
import { Task } from "@prisma/client";
import cuid from "cuid";
import { addDays, addMonths, addWeeks } from "date-fns";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { formatDateForMySQL } from "src/server/trpc/router/logs";
// import toast from "react-hot-toast";

export async function deleteLog(id: string) {
  console.log("deleteLog: ", id);

  const log = await db.delete(eggLog).where(eq(eggLog.id, id));

  revalidatePath(`/app/logs`);

  return log;
}

export async function deleteExpense(id: string) {
  console.log("deleteExpense: ", id);

  const expenseRes = await db.delete(expense).where(eq(expense.id, id));

  revalidatePath(`/app/expenses`);

  return expenseRes;
}

export async function createFlock(input: {
  userId: string;
  name: string;
  description: string;
  type: string;
  imageUrl: string;
}) {
  console.log("createFlock: ", input);

  const id = cuid();

  await db.insert(Flocks).values([
    {
      ...input,
      id: id,
      imageUrl: input.imageUrl ? input.imageUrl : "",
      userId: input.userId,
    },
  ]);

  const [flock] = await db.select().from(Flocks).where(eq(Flocks.id, id));

  if (!flock) {
    throw new Error("Could not create flock.");
  }

  revalidatePath(`/app/flocks/`);

  return flock;
}

export async function updateFlock(input: {
  id: string;
  name: string;
  description: string;
  type: string;
  imageUrl: string;
}) {
  console.log("updateFlock: ", input);

  await db
    .update(Flocks)
    .set({
      ...input,
      imageUrl: input.imageUrl ? input.imageUrl : "",
    })
    .where(eq(Flocks.id, input.id));

  const [flock] = await db.select().from(Flocks).where(eq(Flocks.id, input.id));

  if (!flock) {
    throw new Error("Could not create flock.");
  }

  console.log("Revalidating paths...");

  revalidatePath(`/app/flocks/`);
  revalidatePath(`/app/flocks/[flockId]`);

  console.log("Revalidated paths.");

  return flock;
}

export async function deleteFlock(input: { flockId: string }) {
  console.log("deleteFlock: ", input);

  const [flock] = await db
    .select()
    .from(Flocks)
    .where(eq(Flocks.id, input.flockId));

  if (!flock) {
    throw new Error("Could not find flock.");
  }

  await db.delete(Flocks).where(eq(Flocks.id, flock.id));

  revalidatePath(`/app/flocks/`);
  revalidatePath(`/app/flocks/[flockId]`);

  return flock;
}

export async function updateUser(input: {
  userId: string;
  name: string;
  image: string;
}) {
  await db
    .update(Users)
    .set({
      name: input.name,
      image: input.image,
    })
    .where(eq(Users.id, input.userId));

  const [user] = await db
    .select()
    .from(Users)
    .where(eq(Users.id, input.userId));

  revalidatePath(`/app/settings`);
  revalidatePath(`/app/`);

  return user;
}

export async function markNotificationAsRead(input: {
  notificationId: string;
}) {
  await db
    .update(Notifications)
    .set({
      read: 1,
    })
    .where(eq(Notifications.id, input.notificationId));

  const [notification] = await db
    .select()
    .from(Notifications)
    .where(eq(Notifications.id, input.notificationId));

  revalidatePath(`/app`);

  return notification;
}

// Create new task
export async function createNewTask(input: {
  title: string;
  description: string;
  dueDate: Date;
  recurrence: string;
  flockId: string;
  userId: string;
}) {
  const id = cuid();

  await db.insert(Tasks).values([
    {
      ...input,
      dueDate: formatDateForMySQL(input.dueDate),
      id: id,
    },
  ]);

  const [task] = await db.select().from(Tasks).where(eq(Tasks.id, id));

  if (!task) {
    throw new Error("Could not create task.");
  }

  // revalidatePath(`/app/flocks/[flockId]`);
  revalidatePath(`/app/tasks`);

  return task;
}

// Delete task
export async function deleteTask(input: { taskId: string }) {
  const [task] = await db
    .select()
    .from(Tasks)
    .where(eq(Tasks.id, input.taskId));

  if (!task) {
    throw new Error("Could not find task.");
  }

  await db.delete(Tasks).where(eq(Tasks.id, task.id));

  revalidatePath(`/app/tasks`);

  return task;
}

// Update task
export async function updateTask(input: {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  recurrence: string;
  status: string;
  completed: boolean;
}) {
  await db
    .update(Tasks)
    .set({
      ...input,
      completed: input.completed ? 1 : 0,
      dueDate: formatDateForMySQL(input.dueDate),
    })
    .where(eq(Tasks.id, input.id));

  const [task] = await db.select().from(Tasks).where(eq(Tasks.id, input.id));

  if (!task) {
    throw new Error("Could not find task.");
  }

  revalidatePath(`/app/tasks`);

  return task;
}

// Mark task as complete
export async function markTaskAsComplete(input: {
  taskId: string;
  recurrence: string;
}) {
  let task: Task;
  let id: string;

  switch (input.recurrence) {
    case "daily":
      task = await completeTask(input.taskId);

      id = cuid();

      await db.insert(Tasks).values([
        {
          id: id,
          title: task.title,
          description: task.description,
          dueDate: formatDateForMySQL(addDays(task.dueDate, 1)),
          recurrence: task.recurrence,
          status: "active",
          completed: 0,
          flockId: task.flockId,
          userId: task.userId,
        },
      ]);

      break;
    case "weekly":
      task = await completeTask(input.taskId);

      id = cuid();

      await db.insert(Tasks).values([
        {
          id: id,
          title: task.title,
          description: task.description,
          dueDate: formatDateForMySQL(addWeeks(task.dueDate, 1)),
          recurrence: task.recurrence,
          status: "active",
          completed: 0,
          flockId: task.flockId,
          userId: task.userId,
        },
      ]);

      break;
    case "monthly":
      task = await completeTask(input.taskId);

      id = cuid();

      await db.insert(Tasks).values([
        {
          id: id,
          title: task.title,
          description: task.description,
          dueDate: formatDateForMySQL(addMonths(task.dueDate, 1)),
          recurrence: task.recurrence,
          status: "active",
          completed: 0,
          flockId: task.flockId,
          userId: task.userId,
        },
      ]);

      break;
    default:
      task = await completeTask(input.taskId);
  }

  revalidatePath(`/app/tasks`);

  return task;
}

async function completeTask(taskId: string) {
  await db
    .update(Tasks)
    .set({
      completed: 1,
    })
    .where(eq(Tasks.id, taskId));

  const [result] = await db.select().from(Tasks).where(eq(Tasks.id, taskId));

  if (!result) {
    throw new Error("Could not find task.");
  }

  return {
    ...result,
    completed: result?.completed === 1,
    dueDate: new Date(result.dueDate),
    completedAt: result.completedAt ? new Date(result.completedAt) : null,
  };
}
