import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadDotenv({ path: path.resolve(__dirname, "../../.env"), override: false });
loadDotenv({ path: path.resolve(__dirname, ".env"), override: false });

const databaseUrl =
  process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.DB_URL;

export default defineConfig({
  schema: "./src/lib/db/schema-postgres.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl!,
  },
  tablesFilter: ["flocknerd_*"],
});
// import type { Config } from "drizzle-kit";
// import * as dotenv from "dotenv";
// dotenv.config();
//
// export default {
//   schema: "./src/lib/db/schema.ts",
//   out: "./src/lib/db/migrations",
//   breakpoints: true,
//   driver: "mysql2",
//   dbCredentials: {
//     uri: process.env.DB_URL!,
//   },
//   tablesFilter: ["flocknerd_*"],
// } satisfies Config;
