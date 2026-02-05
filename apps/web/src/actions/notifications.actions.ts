"use server";

import * as notificationsService from "../services/notifications.service";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(input: { notificationId: string }) {
  const result = await notificationsService.markNotificationAsRead(input.notificationId);
  revalidatePath(`/app/flocks`);
  return result;
}
