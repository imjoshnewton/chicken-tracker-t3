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
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

function createEdgeDb() {
  const edgePool = createPool({
    connectionString,
    ssl: true,
  });

  return drizzle(edgePool, { schema });
}

type EdgeDatabase = ReturnType<typeof createEdgeDb>;

let database: EdgeDatabase | undefined;

function getEdgeDb(): EdgeDatabase {
  database ??= createEdgeDb();
  return database;
}

export const edgeDb: EdgeDatabase = new Proxy({} as EdgeDatabase, {
  get(_target, prop) {
    const instance = getEdgeDb();
    const value = instance[prop as keyof EdgeDatabase];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

// Export sql for direct query usage if needed
export { sql };
