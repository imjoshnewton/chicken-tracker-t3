import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql, createPool } from "@vercel/postgres";
import * as schema from "./schema-postgres";

// Create a connection pool using DATABASE_URL
const pool = createPool({
  connectionString: process.env.DATABASE_URL
});

// Use Vercel's postgres client with Neon database
export const db = drizzle(pool, { schema });

// Export sql for direct query usage if needed
export { sql };