import * as notificationsRepo from "../data/notifications.repository";
import { db } from "@lib/db";
import { withTransaction } from "@lib/db/utils";

export const getUserNotifications = async (userId: string) => {
  return notificationsRepo.getNotificationsByUserId(db, userId);
};

export const getUnreadNotifications = async (userId: string) => {
  return notificationsRepo.getUnreadNotificationsByUserId(db, userId);
};

export const markNotificationAsRead = async (notificationId: string) => {
  return withTransaction(async (tx) => {
    const result = await notificationsRepo.markNotificationAsRead(tx, notificationId);
    return result[0];
  }, { maxRetries: 2, operation: "Mark notification as read" });
};
