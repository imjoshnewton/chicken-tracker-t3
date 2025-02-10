import { db } from "@lib/db";
import { eggLog } from "@lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const flockId = url.searchParams.get("flockId");

  if (!flockId) {
    return NextResponse.json({ error: "flockId is required" }, { status: 400 });
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start of the current week (Sunday)

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the month

  const results = await db
    .select({
      today: sql<number>`SUM(CASE WHEN ${eggLog.date} = ${sql.raw(`'${today.toISOString().split("T")[0]}'`)} THEN ${eggLog.count} ELSE 0 END)`,
      yesterday: sql<number>`SUM(CASE WHEN ${eggLog.date} = ${sql.raw(`'${yesterday.toISOString().split("T")[0]}'`)} THEN ${eggLog.count} ELSE 0 END)`,
      week: sql<number>`SUM(CASE WHEN ${eggLog.date} >= ${sql.raw(`'${startOfWeek.toISOString().split("T")[0]}'`)} THEN ${eggLog.count} ELSE 0 END)`,
      month: sql<number>`SUM(CASE WHEN ${eggLog.date} >= ${sql.raw(`'${startOfMonth.toISOString().split("T")[0]}'`)} THEN ${eggLog.count} ELSE 0 END)`,
    })
    .from(eggLog)
    .where(eq(eggLog.flockId, flockId));

  return NextResponse.json(results[0]);
}
