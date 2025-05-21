/**
 * This script compares the performance of the original and optimized server actions
 * Run it with:
 * bun run src/scripts/compare-server-actions.ts
 */
import "dotenv/config";
import { db } from "@lib/db";
import { task as Tasks } from "@lib/db/schema-postgres";
import { and, eq } from "drizzle-orm";
import { formatDateForMySQL } from "../server/trpc/router/logs";
import { createId } from "@paralleldrive/cuid2";
import * as original from "../app/app/server";
import * as optimized from "../app/app/server-optimized";

// Use real test data for accurate performance comparison
const TEST_USER_ID = "cl6l74hjz0057u2pe8bdu24ib"; // User ID for newtonjd1@gmail.com
const TEST_FLOCK_ID = "cl6l74hjz0057u2pe8bdu24ib"; 
const ITERATIONS = 5; // Run each test multiple times for better averages

// Helper function to calculate average time
async function measureAverageTime(fn: () => Promise<any>, name: string, iterations: number) {
  const times: number[] = [];
  
  // Warmup run (not included in timing)
  try {
    await fn();
  } catch (error) {
    console.log(`${name} failed during warmup:`, error);
    return Infinity;
  }
  
  // Timed runs
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      await fn();
      const end = performance.now();
      times.push(end - start);
    } catch (error) {
      console.log(`${name} failed during iteration ${i + 1}:`, error);
      return Infinity;
    }
  }
  
  const average = times.reduce((sum, time) => sum + time, 0) / times.length;
  console.log(`${name}: ${average.toFixed(2)}ms (avg of ${iterations} runs)`);
  return average;
}

// Helper to clean up test data
async function cleanUpTestTask(taskId: string) {
  await db.delete(Tasks).where(eq(Tasks.id, taskId));
}

// Test data
const testTask = {
  title: "Test Task for Performance",
  description: "This is a test task created for performance testing",
  dueDate: new Date(),
  recurrence: "daily",
  flockId: TEST_FLOCK_ID,
  userId: TEST_USER_ID
};

const testRecurringTask = {
  title: "Test Recurring Task for Performance",
  description: "This is a recurring test task created for performance testing",
  dueDate: new Date(),
  recurrence: "daily",
  flockId: TEST_FLOCK_ID,
  userId: TEST_USER_ID
};

async function runTest() {
  console.log(`🔍 Testing server actions performance optimizations (${ITERATIONS} iterations per test)...\n`);
  
  // Keep track of test tasks for cleanup
  const tasksToCleanup: string[] = [];
  
  // Test createNewTask
  console.log("Testing createNewTask function...");
  
  // Original implementation
  let origTaskId = "";
  const origCreateTime = await measureAverageTime(
    async () => {
      const taskId = createId();
      
      await db.insert(Tasks).values([
        {
          ...testTask,
          dueDate: formatDateForMySQL(testTask.dueDate),
          id: taskId,
        },
      ]);
      
      // This is what original code does - separate SELECT after INSERT
      const [task] = await db.select().from(Tasks).where(eq(Tasks.id, taskId));
      
      if (!task) {
        throw new Error("Failed to retrieve the created task");
      }
      
      origTaskId = taskId;
      tasksToCleanup.push(taskId);
      return task;
    },
    "Original createNewTask approach",
    ITERATIONS
  );
  
  // Optimized implementation
  let optTaskId = "";
  const optCreateTime = await measureAverageTime(
    async () => {
      const taskId = createId();
      
      // This is what optimized code does - returns directly from INSERT
      const insertResult = await db.insert(Tasks).values([
        {
          ...testTask,
          dueDate: formatDateForMySQL(testTask.dueDate),
          id: taskId,
        },
      ]).returning();
      
      const task = insertResult[0];
      
      if (!task) {
        throw new Error("Failed to create and return task");
      }
      
      optTaskId = taskId;
      tasksToCleanup.push(taskId);
      return task;
    },
    "Optimized createNewTask approach",
    ITERATIONS
  );
  
  if (origCreateTime !== Infinity && optCreateTime !== Infinity) {
    const createDiff = ((origCreateTime - optCreateTime) / origCreateTime) * 100;
    console.log(`Improvement: ${createDiff.toFixed(2)}%`);
  }
  console.log("\n");
  
  // Test markTaskAsComplete with recurring tasks
  console.log("Testing markTaskAsComplete function with recurring tasks...");
  
  // Create test tasks for marking complete
  const origCompTaskId = createId();
  const optCompTaskId = createId();
  
  // Create test tasks to complete
  await db.insert(Tasks).values([
    {
      ...testRecurringTask,
      dueDate: formatDateForMySQL(testRecurringTask.dueDate),
      id: origCompTaskId,
    },
    {
      ...testRecurringTask,
      dueDate: formatDateForMySQL(testRecurringTask.dueDate),
      id: optCompTaskId,
    }
  ]);
  
  tasksToCleanup.push(origCompTaskId);
  tasksToCleanup.push(optCompTaskId);
  
  // Track recurring tasks that will be created
  let origRecurringTaskId = "";
  let optRecurringTaskId = "";
  
  // Original implementation 
  const origMarkCompleteTime = await measureAverageTime(
    async () => {
      // Simulate original implementation's multiple DB calls
      await db.update(Tasks)
        .set({ completed: true })
        .where(eq(Tasks.id, origCompTaskId));
      
      const [result] = await db.select().from(Tasks).where(eq(Tasks.id, origCompTaskId));
      
      if (!result) {
        throw new Error("Could not find task to mark as completed");
      }
      
      // Create next recurring task
      const newId = createId();
      origRecurringTaskId = newId;
      
      await db.insert(Tasks).values([
        {
          id: newId,
          title: result.title,
          description: result.description,
          dueDate: formatDateForMySQL(new Date(new Date(result.dueDate).getTime() + 86400000)), // +1 day
          recurrence: result.recurrence,
          status: "active",
          completed: false,
          flockId: result.flockId,
          userId: result.userId,
        },
      ]);
      
      // Final select to get the task
      const [task] = await db.select().from(Tasks).where(eq(Tasks.id, newId));
      
      if (!task) {
        throw new Error("Failed to retrieve the new recurring task");
      }
      
      tasksToCleanup.push(newId);
      
      return task;
    },
    "Original markTaskAsComplete approach",
    ITERATIONS
  );
  
  // Optimized implementation (transaction-based)
  const optMarkCompleteTime = await measureAverageTime(
    async () => {
      // Do everything in one "transaction" (simulated here)
      const updateResult = await db.update(Tasks)
        .set({ completed: true })
        .where(eq(Tasks.id, optCompTaskId))
        .returning();
      
      const completedTask = updateResult[0];
      
      if (!completedTask) {
        throw new Error("Could not find task to mark as completed");
      }
      
      const newId = createId();
      optRecurringTaskId = newId;
      
      // Insert the new recurring task
      const insertResult = await db.insert(Tasks).values([
        {
          id: newId,
          title: completedTask.title,
          description: completedTask.description,
          dueDate: formatDateForMySQL(new Date(new Date(completedTask.dueDate).getTime() + 86400000)), // +1 day
          recurrence: completedTask.recurrence,
          status: "active",
          completed: false,
          flockId: completedTask.flockId,
          userId: completedTask.userId,
        },
      ]).returning();
      
      const newTask = insertResult[0];
      
      if (!newTask) {
        throw new Error("Failed to create new recurring task");
      }
      
      tasksToCleanup.push(newId);
      
      return newTask;
    },
    "Optimized markTaskAsComplete approach",
    ITERATIONS
  );
  
  if (origMarkCompleteTime !== Infinity && optMarkCompleteTime !== Infinity) {
    const markCompleteDiff = ((origMarkCompleteTime - optMarkCompleteTime) / origMarkCompleteTime) * 100;
    console.log(`Improvement: ${markCompleteDiff.toFixed(2)}%`);
  }
  console.log("\n");
  
  // Clean up all test tasks
  console.log("Cleaning up test data...");
  for (const taskId of tasksToCleanup) {
    await cleanUpTestTask(taskId);
  }
  
  console.log("✅ Performance test complete!");
}

runTest().catch(console.error);