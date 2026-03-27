import postgres from "postgres";
import {
  adoptTrackedMigrations,
  loadMigrationEnv,
  resolveDatabaseUrl,
} from "./migration-utils";

const run = async () => {
  loadMigrationEnv();
  const dbUrl = resolveDatabaseUrl();
  const sql = postgres(dbUrl.value, { max: 1, ssl: "require" });

  try {
    const adopted = await adoptTrackedMigrations(sql);

    if (adopted.length === 0) {
      console.log("✅ Drizzle migration ledger already matches the repo journal");
      return;
    }

    console.log("✅ Adopted journaled migration(s) into drizzle.__drizzle_migrations:");
    for (const migration of adopted) {
      console.log(`   - ${migration.tag} (${migration.createdAt})`);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
};

run().catch((error) => {
  console.error("❌ db:adopt failed");
  console.error(error);
  process.exit(1);
});
