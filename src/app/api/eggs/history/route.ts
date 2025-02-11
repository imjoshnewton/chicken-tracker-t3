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

  const days = parseInt(url.searchParams.get("days") || "7", 10);

  if (isNaN(days) || days < 1) {
    return NextResponse.json(
      { error: "Invalid days parameter" },
      { status: 400 },
    );
  }

  const today = new Date();
  const dateList = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const dbResults = await db
    .select({
      date: eggLog.date,
      eggs: sql<number>`SUM(${eggLog.count})`,
    })
    .from(eggLog)
    .where(
      and(
        eq(eggLog.flockId, flockId), // Ensure flockId is always a string
        sql`${eggLog.date} >= ${sql.raw(`'${dateList[0]}'`)}`,
      ),
    )
    .groupBy(eggLog.date)
    .orderBy(eggLog.date);

  const dataMap = new Map(dbResults.map(({ date, eggs }) => [date, eggs]));

  const result = dateList.map((date) => ({
    date,
    eggs: date ? dataMap.get(date) ?? 0 : 0,
  }));

  return NextResponse.json({ eggs_data: result });
}
