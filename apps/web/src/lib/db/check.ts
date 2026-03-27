import postgres from "postgres";
import {
  findUnjournaledSqlFiles,
  getAppliedMigrationHashes,
  getTrackedMigrations,
  loadMigrationEnv,
  readSnapshotDialects,
  resolveDatabaseUrl,
} from "./migration-utils";

const runCheck = async () => {
  const envPaths = loadMigrationEnv();
  const dbUrl = resolveDatabaseUrl();
  const trackedMigrations = getTrackedMigrations();
  const unjournaledSqlFiles = findUnjournaledSqlFiles();
  const snapshotDialects = readSnapshotDialects();

  console.log(`✅ Loaded env from ${envPaths.repoEnvPath}`);
  console.log(`✅ Using ${dbUrl.key} for migration commands`);
  console.log(`✅ Journal tracks ${trackedMigrations.length} SQL migration(s)`);

  if (unjournaledSqlFiles.length > 0) {
    console.error("❌ SQL files missing from meta/_journal.json:");
    for (const fileName of unjournaledSqlFiles) {
      console.error(`   - ${fileName}`);
    }
    process.exit(1);
  }

  const legacySnapshots = snapshotDialects.filter(
    (snapshot) => snapshot.dialect !== "postgresql",
  );

  if (legacySnapshots.length > 0) {
    console.warn(
      "⚠️ Legacy Drizzle snapshot metadata detected; repo workflow now uses journal + live DB checks instead of drizzle-kit check.",
    );
    for (const snapshot of legacySnapshots) {
      console.warn(
        `   - ${snapshot.fileName}: dialect=${snapshot.dialect}, version=${snapshot.version}`,
      );
    }
  }

  const sql = postgres(dbUrl.value, { max: 1, ssl: "require" });

  try {
    const appliedRows = await getAppliedMigrationHashes(sql);
    const appliedHashes = new Set(appliedRows.map((row) => row.hash));
    const missingTracked = trackedMigrations.filter(
      (migration) => !appliedHashes.has(migration.hash),
    );

    const userColumns = await sql<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'flocknerd_User'
      ORDER BY ordinal_position
    `;

    const userColumnSet = new Set(userColumns.map((column) => column.column_name));
    const requiredOnboardingColumns = [
      "onboardingStartedAt",
      "onboardingCompletedAt",
      "onboardingCurrentStep",
      "onboardingContext",
    ];
    const missingOnboardingColumns = requiredOnboardingColumns.filter(
      (columnName) => !userColumnSet.has(columnName),
    );

    if (missingTracked.length === 0) {
      console.log("✅ Drizzle ledger contains every journaled migration hash");
    } else {
      console.error("❌ Missing migration hashes in drizzle.__drizzle_migrations:");
      for (const migration of missingTracked) {
        console.error(`   - ${migration.tag}`);
      }
    }

    if (missingOnboardingColumns.length === 0) {
      console.log("✅ Onboarding columns exist on public.flocknerd_User");
    } else {
      console.error("❌ Missing onboarding columns on public.flocknerd_User:");
      for (const columnName of missingOnboardingColumns) {
        console.error(`   - ${columnName}`);
      }
    }

    if (missingTracked.length > 0 || missingOnboardingColumns.length > 0) {
      console.error(
        "👉 Run `bun run db:adopt` if the schema is already correct, or `bun run db:push` if you still need to sync schema changes.",
      );
      process.exit(1);
    }

    console.log("🎉 Migration workflow check passed");
  } finally {
    await sql.end({ timeout: 5 });
  }
};

runCheck().catch((error) => {
  console.error("❌ Migration workflow check failed");
  console.error(error);
  process.exit(1);
});
