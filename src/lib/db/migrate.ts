import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import "dotenv/config";

// inspired by Raphael Moreau @rphlmr for Postgres
const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  // Use postgres.js for migrations
  // For migrations, we use a dedicated connection with optimized settings:
  // - max: 1 - Only need one connection for migrations
  // - idle_timeout: Close connection after 10 seconds of inactivity
  // - connect_timeout: Allow more time to establish initial connection
  const connection = postgres(process.env.POSTGRES_URL, { 
    max: 1,
    idle_timeout: 10, 
    connect_timeout: 10,
    ssl: true
  });
  
  const db = drizzle(connection);

  console.log("⏳ Running migrations...");

  const start = Date.now();

  try {
    await migrate(db, { migrationsFolder: "src/lib/db/migrations" });
    
    const end = Date.now();
    console.log(`✅ Migrations completed in ${end - start}ms`);
  } catch (error) {
    console.error("❌ Migration failed");
    console.error(error);
    process.exit(1);
  } finally {
    // Explicitly end the connection to avoid hanging
    await connection.end();
    process.exit(0);
  }
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
