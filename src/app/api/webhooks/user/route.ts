import type { IncomingHttpHeaders } from "http";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook, WebhookRequiredHeaders } from "svix";
import { db } from "@lib/db";
import { user as Users } from "@lib/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

const webhookSecret = "whsec_ITq1TGfSvKy1eKVfFnUkkLTDuwHWR1Rp";

export const runtime = "edge";

async function handler(request: Request) {
  const payload = await request.json();
  const headersList = headers();
  const heads = {
    "svix-id": headersList.get("svix-id"),
    "svix-timestamp": headersList.get("svix-timestamp"),
    "svix-signature": headersList.get("svix-signature"),
  };
  const wh = new Webhook(webhookSecret);
  let evt: Event | null = null;

  try {
    evt = wh.verify(
      JSON.stringify(payload),
      heads as IncomingHttpHeaders & WebhookRequiredHeaders,
    ) as Event;
  } catch (err) {
    console.error((err as Error).message);
    return NextResponse.json({}, { status: 400 });
  }

  const eventType: EventType = evt.type;
  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, ...attributes } = evt.data;

    // console.log({ id, attributes });

    const clerkId = id as string;
    const name = `${attributes.first_name} ${attributes.last_name}`;
    const email = (attributes.email_addresses as any).find(
      (e: any) => e.id == attributes.primary_email_address_id,
    )?.email_address as string;
    const image = attributes.image_url as string;

    // console.log({ clerkId, name, email, image });
    if (eventType === "user.created") {
      const id = createId();
      await db.insert(Users).values({ id, clerkId, name, email, image });
    } else {
      await db
        .update(Users)
        .set({ clerkId, name, email, image })
        .where(eq(Users.clerkId, clerkId));
    }
  }

  return NextResponse.json({}, { status: 200 });
}

type EventType = "user.created" | "user.updated" | "*";

type Event = {
  data: Record<string, string | number>;
  object: "event";
  type: EventType;
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
