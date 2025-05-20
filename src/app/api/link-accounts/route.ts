import { auth } from "@clerk/nextjs/server";
import { db } from "@lib/db";
import { user } from "@lib/db/schema-postgres";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    // Get the current authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body for secondaryClerkId
    const { secondaryClerkId, email } = await request.json();
    
    if (!secondaryClerkId && !email) {
      return NextResponse.json(
        { error: "Missing secondaryClerkId or email" },
        { status: 400 }
      );
    }
    
    // Find user record with current Clerk ID
    let users;
    
    if (email) {
      // Look up by email
      users = await db
        .select()
        .from(user)
        .where(eq(user.email, email));
    } else {
      // Look up by current userId
      users = await db
        .select()
        .from(user)
        .where(eq(user.clerkId, userId));
    }
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Update the user record with the secondary Clerk ID
    const userToUpdate = users[0];
    
    if (!userToUpdate) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // If linking with current authenticated user's ID
    if (!secondaryClerkId) {
      // Current user is secondary, set secondary ID
      await db
        .update(user)
        .set({ secondaryClerkId: userId })
        .where(eq(user.id, userToUpdate.id));
      
      return NextResponse.json({ 
        success: true, 
        message: "Current user's Clerk ID added as secondary ID"
      });
    }
    
    // If linking with provided secondary ID
    await db
      .update(user)
      .set({ secondaryClerkId })
      .where(eq(user.id, userToUpdate.id));
    
    return NextResponse.json({ 
      success: true, 
      message: "Accounts linked successfully" 
    });
  } catch (error) {
    console.error("Error linking accounts:", error);
    return NextResponse.json(
      { error: "Failed to link accounts" },
      { status: 500 }
    );
  }
}

// GET handler to check linked accounts
export async function GET(request: Request) {
  try {
    // Get the current authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Find user by either primary or secondary Clerk ID
    const users = await db
      .select()
      .from(user)
      .where(
        eq(user.clerkId, userId)
      );
    
    if (users.length === 0) {
      // Check secondary ID
      const secondaryUsers = await db
        .select()
        .from(user)
        .where(
          eq(user.secondaryClerkId, userId)
        );
        
      if (secondaryUsers.length === 0) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        user: {
          ...secondaryUsers[0],
          isSecondary: true
        }
      });
    }
    
    return NextResponse.json({ 
      user: {
        ...users[0],
        isSecondary: false
      } 
    });
  } catch (error) {
    console.error("Error checking linked accounts:", error);
    return NextResponse.json(
      { error: "Failed to check linked accounts" },
      { status: 500 }
    );
  }
}