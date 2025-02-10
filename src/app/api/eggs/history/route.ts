import { db } from "@lib/db";
import { eggLog } from "@lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const flockId = url.searchParams.get("flockId");
  const days = parseInt(url.searchParams.get("days") || "7", 10); // Default to 7 days

  if (!flockId) {
    return NextResponse.json({ error: "flockId is required" }, { status: 400 });
  }

  if (isNaN(days) || days < 1) {
    return NextResponse.json(
      { error: "Invalid days parameter" },
      { status: 400 },
    );
  }

  // Calculate the start date for the requested period
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - days);
  const formattedPastDate = pastDate.toISOString().split("T")[0]; // Ensure format matches DB

  // Query database for historical egg count
  const result = await db
    .select({
      date: eggLog.date,
      eggs: sql<number>`SUM(${eggLog.count})`,
    })
    .from(eggLog)
    .where(
      and(
        eq(eggLog.flockId, flockId),
        sql`${eggLog.date} >= ${sql.raw(`'${formattedPastDate}'`)}`,
      ),
    )
    .groupBy(eggLog.date)
    .orderBy(eggLog.date);

  return NextResponse.json(result);
}
