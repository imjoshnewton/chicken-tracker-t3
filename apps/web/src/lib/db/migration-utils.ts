import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config as loadDotenv } from "dotenv";
import type postgres from "postgres";

type JournalEntry = {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints: boolean;
};

type MigrationJournal = {
  version: string;
  dialect: string;
  entries: JournalEntry[];
};

export type TrackedMigration = JournalEntry & {
  hash: string;
  fileName: string;
  filePath: string;
};

export const getAppRoot = () => path.resolve(__dirname, "../../..");

export const getRepoRoot = () => path.resolve(getAppRoot(), "../..");

export const getMigrationsFolder = () =>
  path.resolve(getAppRoot(), "src/lib/db/migrations");

export const getMetaFolder = () => path.join(getMigrationsFolder(), "meta");

export const loadMigrationEnv = () => {
  const repoEnvPath = path.join(getRepoRoot(), ".env");
  const appEnvPath = path.join(getAppRoot(), ".env");

  loadDotenv({ path: repoEnvPath, override: false });

  if (appEnvPath !== repoEnvPath) {
    loadDotenv({ path: appEnvPath, override: false });
  }

  return {
    appEnvPath,
    repoEnvPath,
  };
};

export const resolveDatabaseUrl = () => {
  const candidates = [
    ["POSTGRES_URL", process.env.POSTGRES_URL],
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["DB_URL", process.env.DB_URL],
  ] as const;

  const resolved = candidates.find(([, value]) => Boolean(value));

  if (!resolved?.[1]) {
    throw new Error(
      "No database URL found. Expected POSTGRES_URL, DATABASE_URL, or DB_URL.",
    );
  }

  return {
    key: resolved[0],
    value: resolved[1],
  };
};

export const readMigrationJournal = (): MigrationJournal => {
  const journalPath = path.join(getMetaFolder(), "_journal.json");
  return JSON.parse(fs.readFileSync(journalPath, "utf8")) as MigrationJournal;
};

export const getTrackedMigrations = (): TrackedMigration[] => {
  const journal = readMigrationJournal();

  return journal.entries.map((entry) => {
    const fileName = `${entry.tag}.sql`;
    const filePath = path.join(getMigrationsFolder(), fileName);
    const fileContents = fs.readFileSync(filePath, "utf8");

    return {
      ...entry,
      fileName,
      filePath,
      hash: crypto.createHash("sha256").update(fileContents).digest("hex"),
    };
  });
};

export const findUnjournaledSqlFiles = () => {
  const trackedTags = new Set(readMigrationJournal().entries.map((entry) => entry.tag));

  return fs
    .readdirSync(getMigrationsFolder())
    .filter((fileName) => fileName.endsWith(".sql"))
    .filter((fileName) => !trackedTags.has(fileName.replace(/\.sql$/, "")))
    .sort();
};

export const readSnapshotDialects = () => {
  return fs
    .readdirSync(getMetaFolder())
    .filter((fileName) => /^\d+_snapshot\.json$/.test(fileName))
    .sort()
    .map((fileName) => {
      const filePath = path.join(getMetaFolder(), fileName);

      try {
        const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
          dialect?: string;
          version?: string;
        };

        return {
          fileName,
          dialect: raw.dialect ?? "unknown",
          version: raw.version ?? "unknown",
        };
      } catch {
        return {
          fileName,
          dialect: "unreadable",
          version: "unreadable",
        };
      }
    });
};

export const ensureMigrationTable = async (sql: postgres.Sql) => {
  await sql`CREATE SCHEMA IF NOT EXISTS "drizzle"`;
  await sql`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;
  await sql`
    SELECT setval(
      pg_get_serial_sequence('"drizzle"."__drizzle_migrations"', 'id'),
      COALESCE((SELECT MAX(id) FROM "drizzle"."__drizzle_migrations"), 0) + 1,
      false
    )
  `;
};

export const getAppliedMigrationHashes = async (sql: postgres.Sql) => {
  await ensureMigrationTable(sql);

  const rows = await sql<{ hash: string; created_at: string | null }[]>`
    SELECT hash, created_at
    FROM "drizzle"."__drizzle_migrations"
    ORDER BY created_at ASC, id ASC
  `;

  return rows;
};

export const adoptTrackedMigrations = async (sql: postgres.Sql) => {
  const trackedMigrations = getTrackedMigrations();
  const appliedRows = await getAppliedMigrationHashes(sql);
  const appliedHashes = new Set(appliedRows.map((row) => row.hash));
  let cursor = appliedRows.reduce((max, row) => {
    const createdAt = Number(row.created_at ?? 0);
    return Number.isFinite(createdAt) ? Math.max(max, createdAt) : max;
  }, 0);

  const adopted: Array<{ tag: string; createdAt: number }> = [];

  for (const migration of trackedMigrations) {
    if (appliedHashes.has(migration.hash)) {
      cursor = Math.max(cursor, migration.when);
      continue;
    }

    cursor = Math.max(cursor + 1, migration.when);

    await sql`
      INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at)
      VALUES (${migration.hash}, ${String(cursor)})
    `;

    adopted.push({ tag: migration.tag, createdAt: cursor });
    appliedHashes.add(migration.hash);
  }

  return adopted;
};
