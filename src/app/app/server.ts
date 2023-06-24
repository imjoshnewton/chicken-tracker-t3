"use server";

import { Task } from "@prisma/client";
import { addDays, addMonths, addWeeks } from "date-fns";
import { revalidatePath } from "next/cache";
import { prisma } from "../../server/db/client";
// import toast from "react-hot-toast";

export async function deleteLog(id: string) {
  console.log("deleteLog: ", id);

  await prisma.eggLog.delete({
    where: {
      id: id,
    },
  });

  revalidatePath(`/app/logs`);

  // return log;
}

export async function deleteExpense(id: string) {
  console.log("deleteExpense: ", id);

  const expense = await prisma.expense.delete({
    where: {
      id: id,
    },
  });

  revalidatePath(`/app/expenses`);

  return expense;
}

export async function createFlock(input: {
  userId: string;
  name: string;
  description: string;
  type: string;
  imageUrl: string;
}) {
  console.log("createFlock: ", input);

  const flock = await prisma.flock.create({
    data: {
      userId: input.userId,
      name: input.name,
      description: input.description,
      type: input.type,
      imageUrl: input.imageUrl ? input.imageUrl : "",
    },
  });

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

  const flock = await prisma.flock.update({
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

  console.log("Revalidating paths...");

  revalidatePath(`/app/flocks/`);
  revalidatePath(`/app/flocks/[flockId]`);

  console.log("Revalidated paths.");

  return flock;
}

export async function updateUser(input: {
  userId: string;
  name: string;
  image: string;
}) {
  const user = await prisma.user.update({
    where: {
      id: input.userId,
    },
    data: {
      name: input.name,
      image: input.image,
    },
  });

  revalidatePath(`/app/settings`);
  revalidatePath(`/app/`);

  return user;
}

export async function markNotificationAsRead(input: {
  notificationId: string;
}) {
  const notification = await prisma.notification.update({
    where: {
      id: input.notificationId,
    },
    data: {
      read: true,
    },
  });

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
  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      flockId: input.flockId,
      userId: input.userId,
      recurrence: input.recurrence,
    },
  });

  // revalidatePath(`/app/flocks/[flockId]`);
  revalidatePath(`/app/tasks`);

  return task;
}

// Delete task
export async function deleteTask(input: { taskId: string }) {
  const task = await prisma.task.delete({
    where: {
      id: input.taskId,
    },
  });

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
  const task = await prisma.task.update({
    where: {
      id: input.id,
    },
    data: {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      recurrence: input.recurrence,
      status: input.status,
      completed: input.completed,
    },
  });

  revalidatePath(`/app/tasks`);

  return task;
}

// Mark task as complete
export async function markTaskAsComplete(input: {
  taskId: string;
  recurrence: string;
}) {
  let task: Task;

  switch (input.recurrence) {
    case "daily":
      task = await prisma.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          completed: true,
        },
      });

      await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          dueDate: addDays(task.dueDate, 1),
          recurrence: task.recurrence,
          status: "active",
          completed: false,
          flockId: task.flockId,
          userId: task.userId,
        },
      });

      break;
    case "weekly":
      task = await prisma.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          completed: true,
        },
      });

      await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          dueDate: addWeeks(task.dueDate, 1),
          recurrence: task.recurrence,
          status: "active",
          completed: false,
          flockId: task.flockId,
          userId: task.userId,
        },
      });

      break;
    case "monthly":
      task = await prisma.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          completed: true,
        },
      });

      await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          dueDate: addMonths(task.dueDate, 1),
          recurrence: task.recurrence,
          status: "active",
          completed: false,
          flockId: task.flockId,
          userId: task.userId,
        },
      });

      break;
    default:
      task = await prisma.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          completed: true,
        },
      });
  }

  revalidatePath(`/app/tasks`);

  return task;
}
