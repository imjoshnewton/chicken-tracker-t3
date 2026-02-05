import { NextResponse } from "next/server";
import { db } from "@lib/db";

export const runtime = "edge";
export const preferredRegion = "auto";

export const GET = async (req: Request) => {
  // Simple endpoint for testing database connectivity
  const currentTimeResult = await db.execute(
    "SELECT NOW() as current_time"
  );

  return NextResponse.json({ 
    connection: "PostgreSQL connection successful",
    currentTime: currentTimeResult.rows[0]?.current_time || new Date().toISOString(),
  }, { status: 200 });
};
