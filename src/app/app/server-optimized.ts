"use server";

import { db } from "@lib/db";
import {
  eggLog,
  expense,
  flock as Flocks,
  notification as Notifications,
  Task,
  task as Tasks,
  user as Users,
} from "@lib/db/schema-postgres";
import { executeWithRetry, withTransaction } from "@lib/db/utils";
import { createId } from "@paralleldrive/cuid2";
import { addDays, addMonths, addWeeks } from "date-fns";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { formatDateForMySQL } from "src/server/trpc/router/logs";

/**
 * Optimized server actions that eliminate N+1 query patterns by:
 * 1. Using transactions for operations that need to be atomic
 * 2. Returning results directly from write operations where possible
 * 3. Eliminating unnecessary read-after-write operations
 * 4. Consolidating repeated query patterns
 */

export async function deleteLog(id: string) {
  return executeWithRetry(async () => {
    const result = await db.delete(eggLog)
      .where(eq(eggLog.id, id))
      .returning(); // Return deleted record directly instead of querying again
    
    revalidatePath(`/app/logs`);
    
    return result[0];
  }, {
    maxRetries: 2,
    operation: "Delete log"
  });
}

export async function deleteExpense(id: string) {
  return executeWithRetry(async () => {
    const result = await db.delete(expense)
      .where(eq(expense.id, id))
      .returning(); // Return deleted record directly instead of querying again
    
    revalidatePath(`/app/expenses`);
    
    return result[0];
  }, {
    maxRetries: 2,
    operation: "Delete expense"
  });
}

export async function createFlock(input: {
  userId: string;
  name: string;
  description: string;
  type: string;
  imageUrl: string;
}) {
  return withTransaction(async (tx) => {
    const id = createId();
    
    // Use returning() to get the created record in a single operation
    const insertResult = await tx.insert(Flocks).values([
      {
        ...input,
        id: id,
        imageUrl: input.imageUrl ? input.imageUrl : "",
        userId: input.userId,
      },
    ]).returning();
    
    const flock = insertResult[0];
    
    if (!flock) {
      throw new Error("Could not create flock.");
    }
    
    revalidatePath(`/app/flocks/`);
    
    return flock;
  }, {
    maxRetries: 3,
    operation: "Create flock"
  });
}

export async function updateFlock(input: {
  id: string;
  name: string;
  description: string;
  type: string;
  imageUrl: string;
}) {
  return withTransaction(async (tx) => {
    // Use returning() to get the updated record in a single operation
    const updateResult = await tx.update(Flocks)
      .set({
        ...input,
        imageUrl: input.imageUrl ? input.imageUrl : "",
      })
      .where(eq(Flocks.id, input.id))
      .returning();
    
    const flock = updateResult[0];
    
    if (!flock) {
      throw new Error("Could not update flock.");
    }
    
    revalidatePath(`/app/flocks/`);
    revalidatePath(`/app/flocks/[flockId]`);
    
    return flock;
  }, {
    maxRetries: 3,
    operation: "Update flock"
  });
}

export async function deleteFlock(input: { flockId: string }) {
  return withTransaction(async (tx) => {
    // Get the flock first to return its details after deletion
    const [flock] = await tx
      .select()
      .from(Flocks)
      .where(eq(Flocks.id, input.flockId));
    
    if (!flock) {
      throw new Error("Could not find flock.");
    }
    
    // Delete the flock
    await tx.delete(Flocks).where(eq(Flocks.id, flock.id));
    
    revalidatePath(`/app/flocks/`);
    revalidatePath(`/app/flocks/[flockId]`);
    
    return flock;
  }, {
    maxRetries: 3,
    operation: "Delete flock"
  });
}

export async function updateUser(input: {
  userId: string;
  name: string;
  image: string;
}) {
  return withTransaction(async (tx) => {
    // Use returning() to get the updated record in a single operation
    const updateResult = await tx.update(Users)
      .set({
        name: input.name,
        image: input.image,
      })
      .where(eq(Users.id, input.userId))
      .returning();
    
    const user = updateResult[0];
    
    if (!user) {
      throw new Error("Could not update user.");
    }
    
    revalidatePath(`/app/settings`);
    revalidatePath(`/app/`);
    
    return user;
  }, {
    maxRetries: 2,
    operation: "Update user"
  });
}

export async function markNotificationAsRead(input: {
  notificationId: string;
}) {
  return withTransaction(async (tx) => {
    // Use returning() to get the updated record in a single operation
    const updateResult = await tx.update(Notifications)
      .set({
        read: true,
      })
      .where(eq(Notifications.id, input.notificationId))
      .returning();
    
    const notification = updateResult[0];
    
    if (!notification) {
      throw new Error("Could not update notification.");
    }
    
    revalidatePath(`/app/flocks`);
    
    return notification;
  }, {
    maxRetries: 2,
    operation: "Mark notification as read"
  });
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
  return withTransaction(async (tx) => {
    const id = createId();
    
    // Use returning() to get the created record in a single operation
    const insertResult = await tx.insert(Tasks).values([
      {
        ...input,
        dueDate: formatDateForMySQL(input.dueDate),
        id: id,
      },
    ]).returning();
    
    const task = insertResult[0];
    
    if (!task) {
      throw new Error("Could not create task.");
    }
    
    revalidatePath(`/app/tasks`);
    
    return task;
  }, {
    maxRetries: 3,
    operation: "Create task"
  });
}

// Delete task
export async function deleteTask(input: { taskId: string }) {
  return withTransaction(async (tx) => {
    // Get the task first to return its details after deletion
    const [task] = await tx
      .select()
      .from(Tasks)
      .where(eq(Tasks.id, input.taskId));
    
    if (!task) {
      throw new Error("Could not find task.");
    }
    
    // Delete the task
    await tx.delete(Tasks).where(eq(Tasks.id, task.id));
    
    revalidatePath(`/app/tasks`);
    
    return task;
  }, {
    maxRetries: 2,
    operation: "Delete task"
  });
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
  return withTransaction(async (tx) => {
    // Use returning() to get the updated record in a single operation
    const updateResult = await tx.update(Tasks)
      .set({
        ...input,
        completed: input.completed,
        dueDate: formatDateForMySQL(input.dueDate),
      })
      .where(eq(Tasks.id, input.id))
      .returning();
    
    const task = updateResult[0];
    
    if (!task) {
      throw new Error("Could not update task.");
    }
    
    revalidatePath(`/app/tasks`);
    
    return task;
  }, {
    maxRetries: 2,
    operation: "Update task"
  });
}

// Mark task as complete with optimized transaction handling
export async function markTaskAsComplete(input: {
  taskId: string;
  recurrence: string;
}) {
  return withTransaction(async (tx) => {
    // Step 1: Update and get the existing task in a single operation
    const [completedTask] = await tx.update(Tasks)
      .set({ completed: true })
      .where(eq(Tasks.id, input.taskId))
      .returning();
    
    if (!completedTask) {
      throw new Error("Could not find task.");
    }
    
    // Step 2: Create a new task if it's recurring
    if (input.recurrence !== "") {
      const id = createId();
      let newDueDate: Date;
      
      // Calculate the new due date based on recurrence
      switch (input.recurrence) {
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
      
      // Insert the new recurring task
      await tx.insert(Tasks).values([
        {
          id,
          title: completedTask.title,
          description: completedTask.description,
          dueDate: formatDateForMySQL(newDueDate),
          recurrence: completedTask.recurrence,
          status: "active",
          completed: false,
          flockId: completedTask.flockId,
          userId: completedTask.userId,
        },
      ]);
    }
    
    revalidatePath(`/app/tasks`);
    
    return completedTask;
  }, {
    maxRetries: 3,
    operation: "Mark task as complete"
  });
}

// This function is no longer needed as its functionality is included in markTaskAsComplete
// Kept here for reference only
async function _completeTask(taskId: string) {
  const [result] = await db.update(Tasks)
    .set({ completed: true })
    .where(eq(Tasks.id, taskId))
    .returning();
    
  if (!result) {
    throw new Error("Could not find task.");
  }
  
  return result;
}