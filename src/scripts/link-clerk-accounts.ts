// Utility script to manually link dev and prod Clerk accounts
import { db } from "../lib/db";
import { user } from "../lib/db/schema-postgres";
import { eq } from "drizzle-orm";

/**
 * This script allows you to manually link a Clerk ID to an existing user by email
 * 
 * Usage:
 *   bun run src/scripts/link-clerk-accounts.ts <email> <clerkId> [--primary]
 * 
 * Arguments:
 *   email: The email of the user to update
 *   clerkId: The Clerk ID to link to the user
 *   --primary: (Optional) Use this flag to set as primary Clerk ID instead of secondary
 */

async function linkAccounts() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error("Usage: bun run src/scripts/link-clerk-accounts.ts <email> <clerkId> [--primary]");
    process.exit(1);
  }
  
  const email = args[0];
  const clerkId = args[1];
  const isPrimary = args.includes("--primary");
  
  console.log(`Linking ${isPrimary ? "primary" : "secondary"} Clerk ID ${clerkId} to user with email ${email}`);
  
  try {
    // Find user by email
    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, email as string));
    
    if (users.length === 0) {
      console.error(`No user found with email ${email}`);
      process.exit(1);
    }
    
    const userToUpdate = users[0];
    if (!userToUpdate) {
      console.error(`User found in array but is undefined`);
      process.exit(1);
    }
    
    console.log("Found user:", userToUpdate);
    
    // Update the user with the provided Clerk ID
    if (isPrimary) {
      // If the primary slot is requested, update it
      await db
        .update(user)
        .set({ clerkId })
        .where(eq(user.id, userToUpdate.id));
      
      console.log(`Updated primary Clerk ID for user ${userToUpdate.name} (${userToUpdate.email})`);
    } else {
      // Otherwise, update the secondary Clerk ID
      await db
        .update(user)
        .set({ secondaryClerkId: clerkId })
        .where(eq(user.id, userToUpdate.id));
      
      console.log(`Updated secondary Clerk ID for user ${userToUpdate.name} (${userToUpdate.email})`);
    }
    
    // Verify the update
    const updatedUsers = await db
      .select()
      .from(user)
      .where(eq(user.id, userToUpdate.id));
    
    if (updatedUsers.length === 0 || !updatedUsers[0]) {
      console.error("Could not find updated user");
      process.exit(1);
    }
    
    const updatedUser = updatedUsers[0];
    console.log("Updated user:", {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      primaryClerkId: updatedUser.clerkId,
      secondaryClerkId: updatedUser.secondaryClerkId
    });
    
    console.log("✅ Accounts linked successfully!");
  } catch (error) {
    console.error("Error linking accounts:", error);
    process.exit(1);
  }
}

linkAccounts().catch(console.error);