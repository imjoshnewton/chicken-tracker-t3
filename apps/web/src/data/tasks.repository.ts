import { task } from "@lib/db/schema-postgres";
import { eq } from "drizzle-orm";
import { db } from "@lib/db";

type DBOrTx = typeof db;

/**
 * Create a new task and return the inserted record.
 */
export const createTask = async (
  dbOrTx: DBOrTx,
  data: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    recurrence: string;
    flockId: string;
    userId: string;
  },
) => {
  return dbOrTx.insert(task).values([data]).returning();
};

/**
 * Get a single task by its ID.
 */
export const getTaskById = async (dbOrTx: DBOrTx, taskId: string) => {
  const [result] = await dbOrTx.select().from(task).where(eq(task.id, taskId));
  return result;
};

/**
 * Delete a task by its ID.
 */
export const deleteTask = async (dbOrTx: DBOrTx, taskId: string) => {
  return dbOrTx.delete(task).where(eq(task.id, taskId));
};

/**
 * Update a task by its ID and return the updated record.
 */
export const updateTask = async (
  dbOrTx: DBOrTx,
  taskId: string,
  data: {
    title: string;
    description: string;
    dueDate: string;
    recurrence: string;
    status: string;
    completed: boolean;
  },
) => {
  return dbOrTx
    .update(task)
    .set(data)
    .where(eq(task.id, taskId))
    .returning();
};

/**
 * Mark a task as completed by its ID and return the updated record.
 */
export const markTaskComplete = async (dbOrTx: DBOrTx, taskId: string) => {
  return dbOrTx
    .update(task)
    .set({ completed: true })
    .where(eq(task.id, taskId))
    .returning();
};

/**
 * Get all tasks belonging to a given flock.
 */
export const getTasksByFlockId = async (dbOrTx: DBOrTx, flockId: string) => {
  return dbOrTx.select().from(task).where(eq(task.flockId, flockId));
};
