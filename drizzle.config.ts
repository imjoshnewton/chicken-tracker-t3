import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/lib/db/schema-postgres.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
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
