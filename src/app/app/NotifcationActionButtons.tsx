"use client";

import type { Notification } from "@lib/db/schema";
import Link from "next/link";
import { markNotificationAsRead } from "./server";

export default function NotificationActionButtons({
  notification,
  closeMenu,
}: {
  notification: Notification;
  closeMenu: () => void;
}) {
  return (
    <div className="mt-3 flex gap-2">
      <button
        className={`${
          notification.read
            ? "rounded border border-gray-700 px-3 py-1 font-normal text-gray-700 opacity-70"
            : "rounded border border-gray-700 px-3 py-1 font-normal text-gray-700 transition-all hover:border-slate-200 hover:bg-slate-200"
        }`}
        onClick={() => {
          markNotificationAsRead({ notificationId: notification.id });
          closeMenu();
        }}
        disabled={!!notification.read}
      >
        Mark as read
      </button>
      <Link
        href={notification.link}
        className="rounded bg-secondary px-3 py-1 text-white transition-all hover:bg-secondary/80"
        onClick={() => {
          markNotificationAsRead({ notificationId: notification.id });
          closeMenu();
        }}
      >
        {notification.action}
      </Link>
    </div>
  );
}
