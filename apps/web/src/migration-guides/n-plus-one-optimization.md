# N+1 Query Optimization Guide

This guide explains how to implement the optimized versions of query functions to resolve N+1 query problems. N+1 query issues occur when we make one query to fetch a list of items, and then make additional queries for each item in that list.

## Key Optimizations

1. **Consolidated Queries**: Merging multiple separate database calls into single operations
2. **Parallel Query Execution**: Using Promise.all to run independent queries concurrently
3. **Transaction Support**: Ensuring data consistency while optimizing connection usage
4. **Error Handling with Retries**: Making queries more robust in serverless environments

## Implementation Steps

### 1. Replace the Fetch Functions

The first step is to replace the original fetch functions with the optimized versions:

```bash
# Backup original fetch.ts
cp src/lib/fetch.ts src/lib/fetch.original.ts

# Replace with optimized version
cp src/lib/fetch-optimized.ts src/lib/fetch.ts
```

### 2. Update the Router Files

Replace the original router files with their optimized versions:

```bash
# Backup original router files
cp src/server/trpc/router/logs.ts src/server/trpc/router/logs.original.ts
cp src/server/trpc/router/expenses.ts src/server/trpc/router/expenses.original.ts
cp src/server/trpc/router/stats.ts src/server/trpc/router/stats.original.ts

# Replace with optimized versions
cp src/server/trpc/router/logs-optimized.ts src/server/trpc/router/logs.ts
cp src/server/trpc/router/expenses-optimized.ts src/server/trpc/router/expenses.ts
cp src/server/trpc/router/stats-optimized.ts src/server/trpc/router/stats.ts
```

You don't need to update the _app.ts file since the imports will work with the same filenames.

### 3. Test the Performance Improvements

Run the performance comparison script to verify the optimizations:

```bash
npx tsx src/scripts/compare-query-performance.ts
```

Adjust the TEST_USER_ID, TEST_FLOCK_ID, TEST_MONTH, and TEST_YEAR variables in the script to match your actual data.

## Key Patterns to Avoid

1. **Separate Data and Count Queries**: Always try to run these in parallel or use a single query with SQL window functions
2. **Sequential Dependent Queries**: When possible, structure your data to allow for parallel querying
3. **Multiple Small Queries**: Consolidate related queries to reduce connection overhead
4. **Missing Error Handling**: Always include retry logic for database operations in serverless environments

## Additional N+1 Areas to Check

The following areas might still have N+1 query patterns that could be optimized:

1. **Any component that maps over a list and fetches data for each item**
2. **API routes that make multiple database calls**
3. **Server-side functions that fetch relationships in separate queries**

## Performance Monitoring

To measure the impact of these optimizations:

1. Use the Vercel dashboard to monitor function execution times
2. Add logging around database operations to track durations
3. Monitor Neon compute usage before and after deployment

## Rollback Plan

If you encounter issues with the optimized versions:

```bash
# Restore original files
cp src/lib/fetch.original.ts src/lib/fetch.ts
cp src/server/trpc/router/logs.original.ts src/server/trpc/router/logs.ts
cp src/server/trpc/router/expenses.original.ts src/server/trpc/router/expenses.ts
cp src/server/trpc/router/stats.original.ts src/server/trpc/router/stats.ts
```