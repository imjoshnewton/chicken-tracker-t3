import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql, createPool } from "@vercel/postgres";
import * as schema from "./schema-postgres";

// Create an optimized connection pool using DATABASE_URL
const pool = createPool({
  connectionString: process.env.DATABASE_URL,
  // Optimize for Vercel serverless with Neon:
  // - Max: Limit total connections to avoid overloading Neon (which has connection limits)
  // - Min: Keep some connections warm to reduce cold starts
  // - Idle timeout: Release connections when not in use to save compute resources
  max: 10,  
  min: 2,
  connectionTimeoutMillis: 5000, // 5 seconds to establish a connection
  idleTimeoutMillis: 10000, // 10 seconds idle before releasing connection
  keepAlive: true, // Keep connections alive to reduce connection churn
  ssl: true, // Secure connections
  application_name: "chicken-tracker" // Identify app in Neon monitoring
});

// Use Vercel's postgres client with Neon database
export const db = drizzle(pool, { schema });

// Export sql for direct query usage if needed
export { sql };