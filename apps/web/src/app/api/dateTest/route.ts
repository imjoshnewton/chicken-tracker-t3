import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    currentTime: new Date().toISOString(),
  }, { status: 200 });
};
