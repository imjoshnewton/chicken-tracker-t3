import { notification } from "@lib/db/schema-postgres";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@lib/db";

type DBOrTx = typeof db;

export const getNotificationsByUserId = async (dbOrTx: DBOrTx, userId: string) => {
  return dbOrTx
    .select()
    .from(notification)
    .limit(10)
    .orderBy(desc(notification.date))
    .where(eq(notification.userId, userId));
};

export const getUnreadNotificationsByUserId = async (dbOrTx: DBOrTx, userId: string) => {
  return dbOrTx
    .select()
    .from(notification)
    .where(
      and(
        eq(notification.userId, userId),
        eq(notification.read, false),
      ),
    )
    .limit(10);
};

export const markNotificationAsRead = async (dbOrTx: DBOrTx, notificationId: string) => {
  return dbOrTx
    .update(notification)
    .set({ read: true })
    .where(eq(notification.id, notificationId))
    .returning();
};
