import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql, createPool } from "@vercel/postgres";
import * as schema from "./schema-postgres";

// Detect if we're running in Edge Runtime
// Using a safer check method that won't cause issues during static analysis
const isEdgeRuntime = typeof process !== 'undefined' && 
  process.env.NEXT_RUNTIME === 'edge';

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

function createDb() {
  const pool = createPool({
    connectionString,
    ...(isEdgeRuntime
      ? {
          ssl: true,
        }
      : {
          max: 10,
          min: 2,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 10000,
          keepAlive: true,
          ssl: true,
        }),
  });

  return drizzle(pool, { schema });
}

type Database = ReturnType<typeof createDb>;

let database: Database | undefined;

function getDb(): Database {
  database ??= createDb();
  return database;
}

export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof Database];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

// Export sql for direct query usage if needed
export { sql };
