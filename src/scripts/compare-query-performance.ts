/**
 * This script compares the performance of the original and optimized database query functions
 * Run it with:
 * npx tsx src/scripts/compare-query-performance.ts
 */
import "dotenv/config";
import { fetchExpenses, fetchLogs, getSummaryData } from "../lib/fetch";
import * as optimized from "../lib/fetch-optimized";

// Sample test data - replace with real data when running
const TEST_USER_ID = "test-user-id";
const TEST_FLOCK_ID = "test-flock-id";
const TEST_MONTH = "05";
const TEST_YEAR = "2025";

async function runTest() {
  console.log("🔍 Testing query performance optimizations...\n");

  // Test fetchLogs
  console.log("Testing fetchLogs function...");
  console.time("Original fetchLogs");
  try {
    await fetchLogs(TEST_USER_ID, 0, TEST_FLOCK_ID);
    console.timeEnd("Original fetchLogs");
  } catch (error) {
    console.log("Original fetchLogs failed:", error);
  }

  console.time("Optimized fetchLogs");
  try {
    await optimized.fetchLogs(TEST_USER_ID, 0, TEST_FLOCK_ID);
    console.timeEnd("Optimized fetchLogs");
  } catch (error) {
    console.log("Optimized fetchLogs failed:", error);
  }
  console.log("\n");

  // Test fetchExpenses
  console.log("Testing fetchExpenses function...");
  console.time("Original fetchExpenses");
  try {
    await fetchExpenses(TEST_USER_ID, 0, TEST_FLOCK_ID);
    console.timeEnd("Original fetchExpenses");
  } catch (error) {
    console.log("Original fetchExpenses failed:", error);
  }

  console.time("Optimized fetchExpenses");
  try {
    await optimized.fetchExpenses(TEST_USER_ID, 0, TEST_FLOCK_ID);
    console.timeEnd("Optimized fetchExpenses");
  } catch (error) {
    console.log("Optimized fetchExpenses failed:", error);
  }
  console.log("\n");

  // Test getSummaryData
  console.log("Testing getSummaryData function...");
  console.time("Original getSummaryData");
  try {
    await getSummaryData({
      flockId: TEST_FLOCK_ID,
      month: TEST_MONTH,
      year: TEST_YEAR,
    });
    console.timeEnd("Original getSummaryData");
  } catch (error) {
    console.log("Original getSummaryData failed:", error);
  }

  console.time("Optimized getSummaryData");
  try {
    await optimized.getSummaryData({
      flockId: TEST_FLOCK_ID,
      month: TEST_MONTH,
      year: TEST_YEAR,
    });
    console.timeEnd("Optimized getSummaryData");
  } catch (error) {
    console.log("Optimized getSummaryData failed:", error);
  }
  console.log("\n");

  console.log("✅ Performance test complete!");
}

runTest().catch(console.error);