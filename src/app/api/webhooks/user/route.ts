import type { IncomingHttpHeaders } from "http";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook, WebhookRequiredHeaders } from "svix";
import { db } from "@lib/db";
import { user as Users } from "@lib/db/schema-postgres";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

const webhookSecret = "whsec_ITq1TGfSvKy1eKVfFnUkkLTDuwHWR1Rp";

export const runtime = "edge";
export const preferredRegion = "auto";

async function handler(request: Request) {
  const payload = await request.json();
  
  // Next.js 15 updated headers() to be async
  const headersList = await headers();
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

    const clerkId = id as string;
    const name = `${attributes.first_name} ${attributes.last_name}`;
    const email = (attributes.email_addresses as any).find(
      (e: any) => e.id == attributes.primary_email_address_id,
    )?.email_address as string;
    const image = attributes.image_url as string;

    // For user.created, check if user with the same email exists before creating a new record
    if (eventType === "user.created") {
      // Try to find existing user by email
      const existingUsers = await db
        .select()
        .from(Users)
        .where(eq(Users.email, email));
      
      if (existingUsers.length > 0) {
        // User exists with this email, update either primary or secondary ClerkId
        const existingUser = existingUsers[0];
        
        if (existingUser && !existingUser.clerkId) {
          // If primary clerkId is empty, use it
          await db
            .update(Users)
            .set({ clerkId, name, image })
            .where(eq(Users.id, existingUser.id));
        } else if (existingUser && existingUser.clerkId !== clerkId && !existingUser.secondaryClerkId) {
          // If primary is occupied but secondary is empty, use secondary
          await db
            .update(Users)
            .set({ secondaryClerkId: clerkId, name, image })
            .where(eq(Users.id, existingUser.id));
        } 
        // In case both are filled, we don't overwrite anything
      } else {
        // No existing user, create a new one
        const id = createId();
        await db.insert(Users).values({ id, clerkId, name, email, image });
      }
    } else if (eventType === "user.updated") {
      // First, check if user exists with this primary clerkId
      const primaryUsers = await db
        .select()
        .from(Users)
        .where(eq(Users.clerkId, clerkId));
      
      if (primaryUsers.length > 0) {
        // Update primary user
        await db
          .update(Users)
          .set({ name, email, image })
          .where(eq(Users.clerkId, clerkId));
      } else {
        // Try to update by secondary clerkId
        await db
          .update(Users)
          .set({ name, email, image })
          .where(eq(Users.secondaryClerkId, clerkId));
      }
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
