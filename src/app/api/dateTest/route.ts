import { NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@lib/db";
import { dateTest } from "@lib/db/schema";

export const runtime = "edge";

export const GET = async (req: Request) => {
  const id = createId();

  await db.insert(dateTest).values({
    d_column: new Date(),
    dt_column: new Date(),
  });

  const result = await db.select().from(dateTest);

  console.log("Date:; ", new Date());
  console.log("Result: ", result);

  return NextResponse.json({ result }, { status: 200 });
};
