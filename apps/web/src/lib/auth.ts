import { currentUser } from "@clerk/nextjs/server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "./db";
import { user } from "./db/schema-postgres";

export async function currentUsr() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/auth/sign-in");
  }

  // Try to find user by primary or secondary Clerk ID
  const [usr] = await db
    .select()
    .from(user)
    .where(
      // Check both primary and secondary Clerk IDs
      // This uses an OR condition to match either ID
      sql`${user.clerkId} = ${clerkUser.id} OR ${user.secondaryClerkId} = ${clerkUser.id}`
    );

  if (!usr) {
    // If no user found with either clerk ID, it's a new user
    console.log(`No user found for Clerk ID: ${clerkUser.id}`);
  }

  return { ...clerkUser, ...usr };
}
