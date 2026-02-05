// Import from '@lib/db' instead
// This file is kept for backwards compatibility
// New code should use the Drizzle client from '@lib/db'

import { db } from "@lib/db";

// Re-export the DB client
export { db as prisma };

// Export the sql client for direct query usage if needed
export { sql } from "@lib/db";
