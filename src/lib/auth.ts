import { currentUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "./db";
import { user } from "./db/schema";

export async function currentUsr() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/auth/sign-in");
  }

  const [usr] = await db
    .select()
    .from(user)
    .where(eq(user.clerkId, clerkUser.id));

  return { ...clerkUser, ...usr };
}
