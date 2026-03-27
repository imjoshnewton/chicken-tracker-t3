import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { loadMigrationEnv, resolveDatabaseUrl } from "./migration-utils";

// inspired by Raphael Moreau @rphlmr for Postgres
const runMigrate = async () => {
  loadMigrationEnv();
  const dbUrl = resolveDatabaseUrl();

  // Use postgres.js for migrations
  // For migrations, we use a dedicated connection with optimized settings:
  // - max: 1 - Only need one connection for migrations
  // - idle_timeout: Close connection after 10 seconds of inactivity
  // - connect_timeout: Allow more time to establish initial connection
  const connection = postgres(dbUrl.value, {
    max: 1,
    idle_timeout: 10,
    connect_timeout: 10,
    ssl: true,
  });

  const db = drizzle(connection);
  const migrationsFolder = path.join(__dirname, "migrations");

  console.log(`⏳ Running migrations using ${dbUrl.key}...`);

  const start = Date.now();
  let failed = false;

  try {
    await migrate(db, { migrationsFolder });

    const end = Date.now();
    console.log(`✅ Migrations completed in ${end - start}ms`);
  } catch (error) {
    failed = true;
    console.error("❌ Migration failed");
    console.error(error);
  } finally {
    await connection.end();
  }

  if (failed) {
    process.exit(1);
  }
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
