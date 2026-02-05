import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql, createPool } from "@vercel/postgres";
import * as schema from "./schema-postgres";

/**
 * Edge-specific database client
 * 
 * Edge Runtime doesn't support connection pooling the same way as Node.js
 * so we need to configure it differently. The Vercel Postgres client will 
 * override max connections to 10,000 in Edge Runtime anyway.
 */
const edgePool = createPool({
  connectionString: process.env.DATABASE_URL,
  // Edge Runtime will override these values anyway
  // but we set reasonable defaults
  ssl: true,
});

// Use Vercel's postgres client with Neon database
export const edgeDb = drizzle(edgePool, { schema });

// Export sql for direct query usage if needed
export { sql };