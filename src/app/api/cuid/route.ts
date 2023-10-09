import { NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";

export const runtime = "edge";

export const GET = async (req: Request) => {
  const id = createId();

  return NextResponse.json({ id }, { status: 200 });
};
