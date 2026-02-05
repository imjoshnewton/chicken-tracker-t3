import { sql } from "@vercel/postgres";

export async function migrate() {
  console.log("Running migration: Adding secondaryClerkId column to User table");
  
  try {
    // Check if the column already exists
    const checkColumnResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'flocknerd_User' 
      AND column_name = 'secondaryClerkId'
    `;
    
    if (checkColumnResult.rows.length === 0) {
      // Column doesn't exist, add it
      await sql`
        ALTER TABLE "flocknerd_User" 
        ADD COLUMN "secondaryClerkId" varchar(255)
      `;
      
      // Create an index on the new column
      await sql`
        CREATE INDEX "User_secondaryClerkId_idx" ON "flocknerd_User" ("secondaryClerkId")
      `;
      
      console.log("Migration successful: secondaryClerkId column added");
    } else {
      console.log("Column secondaryClerkId already exists, skipping migration");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, error };
  }
}

// Run this migration if this script is executed directly
if (require.main === module) {
  migrate()
    .then((result) => {
      console.log("Migration result:", result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Migration error:", error);
      process.exit(1);
    });
}