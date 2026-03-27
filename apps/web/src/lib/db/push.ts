import path from "node:path";
import { spawn } from "node:child_process";
import postgres from "postgres";
import {
  adoptTrackedMigrations,
  getAppRoot,
  getRepoRoot,
  loadMigrationEnv,
  resolveDatabaseUrl,
} from "./migration-utils";

const run = async () => {
  loadMigrationEnv();

  const drizzleKitBin = path.join(getRepoRoot(), "node_modules/drizzle-kit/bin.cjs");
  const configPath = path.join(getAppRoot(), "drizzle.config.ts");

  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [drizzleKitBin, "push", "--config", configPath], {
      cwd: getAppRoot(),
      env: process.env,
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`drizzle-kit push exited with code ${code ?? "unknown"}`));
    });

    child.on("error", reject);
  });

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
  console.error("❌ db:push failed");
  console.error(error);
  process.exit(1);
});
