import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "./schema-postgres";

// Use Vercel's postgres client with Neon database
// It will automatically use the POSTGRES_URL environment variable
export const db = drizzle(sql, { schema });

// Export sql for direct query usage if needed
export { sql };