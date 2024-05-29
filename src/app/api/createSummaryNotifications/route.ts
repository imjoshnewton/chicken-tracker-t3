import { db } from "@lib/db";
import { flock, notification } from "@lib/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { verifySignatureEdge } from "@upstash/qstash/nextjs";
import { subMonths } from "date-fns";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

async function handler(_req: NextRequest) {
  const today = new Date();
  const monthNum = subMonths(today, 1).getMonth() + 1;
  const monthString = monthNum < 10 ? `0${monthNum}` : monthNum.toString();
  const monthName = subMonths(today, 1).toLocaleString("default", {
    month: "long",
  });
  const year = subMonths(today, 1).getFullYear();
  const yearString = year.toString();

  console.log("Month Number: ", monthNum);
  console.log("Month String: ", monthString);
  console.log("Year: ", year);
  console.log("Year String: ", yearString);

  const flocks = await db.select().from(flock).where(eq(flock.deleted, 0));

  const newNotifications = await db.insert(notification).values(
    flocks.map((flock) => {
      const id = createId();
      return {
        id,
        title: `Your ${monthName} summary is ready!`,
        message: `Check out your flock stats for ${monthName}.`,
        link: `/app/flocks/${flock.id}/summary?month=${monthString}&year=${yearString}`,
        userId: flock.userId,
        readDate: null,
      };
    }),
  );

  console.log("New Notifications: ", newNotifications);

  return NextResponse.json(
    { notifications: newNotifications },
    { status: 200 },
  );
}

export const POST = verifySignatureEdge(handler);

export const runtime = "edge";
