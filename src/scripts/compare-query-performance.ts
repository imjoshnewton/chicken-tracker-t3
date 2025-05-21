/**
 * This script compares the performance of the original and optimized database query functions
 * Run it with:
 * bun run src/scripts/compare-query-performance.ts
 */
import "dotenv/config";
import { fetchExpenses, fetchLogs, getSummaryData } from "../lib/fetch";
import * as optimized from "../lib/fetch-optimized";

// Real test data for accurate performance comparison
const TEST_USER_ID = "cl6l74hjz0057u2pe8bdu24ib"; // User ID associated with newtonjd1@gmail.com
const TEST_FLOCK_ID = "cl6l74hjz0057u2pe8bdu24ib"; // Specific flock ID
const TEST_MONTH = "05";
const TEST_YEAR = "2023";
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

async function runTest() {
  console.log(`🔍 Testing query performance optimizations (${ITERATIONS} iterations per test)...\n`);

  // Test fetchLogs
  console.log("Testing fetchLogs function...");
  const origLogsTime = await measureAverageTime(
    () => fetchLogs(TEST_USER_ID, 0, TEST_FLOCK_ID),
    "Original fetchLogs",
    ITERATIONS
  );
  
  const optLogsTime = await measureAverageTime(
    () => optimized.fetchLogs(TEST_USER_ID, 0, TEST_FLOCK_ID),
    "Optimized fetchLogs",
    ITERATIONS
  );
  
  if (origLogsTime !== Infinity && optLogsTime !== Infinity) {
    const logsDiff = ((origLogsTime - optLogsTime) / origLogsTime) * 100;
    console.log(`Improvement: ${logsDiff.toFixed(2)}%`);
  }
  console.log("\n");

  // Test fetchExpenses
  console.log("Testing fetchExpenses function...");
  const origExpTime = await measureAverageTime(
    () => fetchExpenses(TEST_USER_ID, 0, TEST_FLOCK_ID),
    "Original fetchExpenses",
    ITERATIONS
  );
  
  const optExpTime = await measureAverageTime(
    () => optimized.fetchExpenses(TEST_USER_ID, 0, TEST_FLOCK_ID),
    "Optimized fetchExpenses",
    ITERATIONS
  );
  
  if (origExpTime !== Infinity && optExpTime !== Infinity) {
    const expDiff = ((origExpTime - optExpTime) / origExpTime) * 100;
    console.log(`Improvement: ${expDiff.toFixed(2)}%`);
  }
  console.log("\n");

  // Test getSummaryData
  console.log("Testing getSummaryData function...");
  const origSummaryTime = await measureAverageTime(
    () => getSummaryData({
      flockId: TEST_FLOCK_ID,
      month: TEST_MONTH,
      year: TEST_YEAR,
    }),
    "Original getSummaryData",
    ITERATIONS
  );
  
  const optSummaryTime = await measureAverageTime(
    () => optimized.getSummaryData({
      flockId: TEST_FLOCK_ID,
      month: TEST_MONTH,
      year: TEST_YEAR,
    }),
    "Optimized getSummaryData",
    ITERATIONS
  );
  
  if (origSummaryTime !== Infinity && optSummaryTime !== Infinity) {
    const summaryDiff = ((origSummaryTime - optSummaryTime) / origSummaryTime) * 100;
    console.log(`Improvement: ${summaryDiff.toFixed(2)}%`);
  }
  console.log("\n");

  console.log("✅ Performance test complete!");
}

runTest().catch(console.error);