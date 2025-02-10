import { db } from "@lib/db";
import { eggLog } from "@lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const flockId = url.searchParams.get("flockId");

  if (!flockId) {
    return NextResponse.json({ error: "flockId is required" }, { status: 400 });
  }

  // Ensure date format matches what is stored in MySQL
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Use `sql.raw()` to ensure the date comparison works correctly
  const result = await db
    .select({ count: sql<number>`SUM(${eggLog.count})` })
    .from(eggLog)
    .where(
      and(eq(eggLog.flockId, flockId), eq(eggLog.date, sql.raw(`'${today}'`))),
    );

  return NextResponse.json({ count: result[0]?.count ?? 0 });
}
