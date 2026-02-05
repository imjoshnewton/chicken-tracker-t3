import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql, createPool } from "@vercel/postgres";
import * as schema from "./schema-postgres";

// Detect if we're running in Edge Runtime
// Using a safer check method that won't cause issues during static analysis
const isEdgeRuntime = typeof process !== 'undefined' && 
  process.env.NEXT_RUNTIME === 'edge';

// Create an optimized connection pool using DATABASE_URL
const pool = createPool({
  connectionString: process.env.DATABASE_URL,
  ...(isEdgeRuntime
    ? {
        // Edge Runtime has different connection handling
        ssl: true,
      }
    : {
        // Optimize for Vercel serverless with Neon:
        // - Max: Limit total connections to avoid overloading Neon 
        // - Min: Keep some connections warm to reduce cold starts
        // - Idle timeout: Release connections when not in use
        max: 10,
        min: 2,
        connectionTimeoutMillis: 5000, // 5 seconds to establish connection
        idleTimeoutMillis: 10000, // 10 seconds idle before releasing
        keepAlive: true, // Keep connections alive to reduce connection churn
        ssl: true, // Secure connections
      }),
});

// Use Vercel's postgres client with Neon database
export const db = drizzle(pool, { schema });

// Export sql for direct query usage if needed
export { sql };