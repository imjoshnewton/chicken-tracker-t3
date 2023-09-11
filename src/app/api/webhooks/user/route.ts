import { prisma } from "../../../../server/db/client";
import type { IncomingHttpHeaders } from "http";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook, WebhookRequiredHeaders } from "svix";

const webhookSecret = "whsec_+SfGI52GxrWmhHBZfEGRajXHCDTIFE7a";

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
      heads as IncomingHttpHeaders & WebhookRequiredHeaders
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
      (e: any) => e.id == attributes.primary_email_address_id
    )?.email_address as string;
    const image = attributes.image_url as string;

    // console.log({ clerkId, name, email, image });

    await prisma.user.upsert({
      where: { clerkId: id as string },
      create: {
        clerkId,
        name,
        email,
        image,
      },
      update: {
        name,
        email,
        image,
      },
    });
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
