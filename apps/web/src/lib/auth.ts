import { currentUser } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "./db";
import { user } from "./db/schema-postgres";

type DbUser = typeof user.$inferSelect;
type ClerkUserShape = {
  id: string;
  fullName: string | null;
  imageUrl: string;
  primaryEmailAddressId: string | null;
  primaryEmailAddress?: {
    emailAddress: string;
  } | null;
  emailAddresses: Array<{
    id: string;
    emailAddress: string;
  }>;
};

export type CurrentUsr = ClerkUserShape & Partial<DbUser>;

export async function currentUsr(): Promise<CurrentUsr> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/auth/sign-in");
  }

  const normalizedClerkUser: ClerkUserShape = {
    id: clerkUser.id,
    fullName: clerkUser.fullName,
    imageUrl: clerkUser.imageUrl,
    primaryEmailAddressId: clerkUser.primaryEmailAddressId,
    primaryEmailAddress: clerkUser.primaryEmailAddress
      ? {
          emailAddress: clerkUser.primaryEmailAddress.emailAddress,
        }
      : null,
    emailAddresses: clerkUser.emailAddresses.map((email) => ({
      id: email.id,
      emailAddress: email.emailAddress,
    })),
  };

  const primaryEmail =
    normalizedClerkUser.emailAddresses.find(
      (email) => email.id === normalizedClerkUser.primaryEmailAddressId,
    )?.emailAddress ?? null;

  const [usr] = await db
    .select()
    .from(user)
    .where(
      sql`${user.clerkId} = ${clerkUser.id} OR ${user.secondaryClerkId} = ${clerkUser.id}`,
    );

  if (usr) {
    return { ...normalizedClerkUser, ...usr };
  }

  if (primaryEmail) {
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, primaryEmail))
      .limit(1);

    if (existingUser) {
      const nextUser =
        !existingUser.clerkId
          ? await db
              .update(user)
              .set({
                clerkId: clerkUser.id,
                email: primaryEmail,
                image: normalizedClerkUser.imageUrl,
                name: normalizedClerkUser.fullName ?? existingUser.name,
              })
              .where(eq(user.id, existingUser.id))
              .returning()
          : existingUser.clerkId !== clerkUser.id && !existingUser.secondaryClerkId
            ? await db
                .update(user)
                .set({
                  secondaryClerkId: clerkUser.id,
                  email: primaryEmail,
                  image: normalizedClerkUser.imageUrl,
                  name: normalizedClerkUser.fullName ?? existingUser.name,
                })
                .where(eq(user.id, existingUser.id))
                .returning()
            : [existingUser];

      if (nextUser[0]) {
        return { ...normalizedClerkUser, ...nextUser[0] };
      }
    }
  }

  const [createdUser] = await db
    .insert(user)
    .values({
      id: createId(),
      clerkId: clerkUser.id,
      email: primaryEmail,
      image: normalizedClerkUser.imageUrl,
      name: normalizedClerkUser.fullName ?? primaryEmail ?? "FlockNerd User",
    })
    .onConflictDoNothing()
    .returning();

  if (createdUser) {
    return { ...normalizedClerkUser, ...createdUser };
  }

  const [retriedUser] = await db
    .select()
    .from(user)
    .where(
      sql`${user.clerkId} = ${clerkUser.id} OR ${user.secondaryClerkId} = ${clerkUser.id}`,
    )
    .limit(1);

  if (!retriedUser) {
    console.log(`No user found for Clerk ID: ${clerkUser.id}`);
    return normalizedClerkUser;
  }

  return { ...normalizedClerkUser, ...retriedUser };
}
