import { db, sql } from "./index";

/**
 * Execute a database query with retry logic
 * This is useful for serverless environments where database connections can be unstable
 */
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number; 
    backoff?: boolean;
    operation?: string;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 50,
    backoff = true,
    operation = "Database operation"
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Attempt to execute the query function
      return await queryFn();
    } catch (error) {
      lastError = error;
      
      // Last attempt - re-throw the error
      if (attempt === maxRetries) {
        console.error(`${operation} failed after ${maxRetries} attempts:`, error);
        throw error;
      }

      // Exponential backoff
      if (backoff) {
        delay = delay * 2;
      }

      // Wait before the next retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.warn(`${operation} failed (attempt ${attempt + 1}/${maxRetries}). Retrying...`);
    }
  }

  // This should never be reached due to the throw in the loop
  throw lastError;
}

/**
 * Check if the database connection is healthy
 * Useful for verifying connectivity before critical operations
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Simple query to check if the database is responsive
    const result = await sql`SELECT 1 as connected`;
    return result.rows.length > 0 && result.rows[0]?.connected === 1;
  } catch (error) {
    console.error("Database connection check failed:", error);
    return false;
  }
}

/**
 * Execute a database transaction with retry logic
 * This ensures that all operations either succeed or fail together
 */
export async function withTransaction<T>(
  transactionFn: (tx: typeof db) => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    operation?: string;
  } = {}
): Promise<T> {
  return executeWithRetry(async () => {
    // Start a transaction
    const result = await sql.query('BEGIN');
    
    try {
      // Execute the transaction function
      const data = await transactionFn(db);
      
      // Commit the transaction
      await sql.query('COMMIT');
      
      return data;
    } catch (error) {
      // Rollback on error
      await sql.query('ROLLBACK');
      throw error;
    }
  }, {
    ...options,
    operation: options.operation || 'Database transaction'
  });
}