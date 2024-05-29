import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DB_URL!,
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
