import type { Notification } from "@lib/db/schema";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { trpc } from "@utils/trpc";

export default function NotificationActionButtons({
  notification,
  isOpen,
  index,
  closeMenu,
}: {
  notification: Notification;
  isOpen: boolean;
  index: number;
  closeMenu: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const linkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (isOpen && index === 0) {
      if (!notification.read && buttonRef.current) {
        buttonRef.current.focus();
      } else if (linkRef.current) {
        linkRef.current.focus();
      }
    }
  }, [isOpen, index, notification.read]);

  const utils = trpc.useUtils();
  const { mutateAsync: markNotificationAsRead } =
    trpc.auth.markNotificationasRead.useMutation({
      onSuccess() {
        console.log("Marked as read");
        utils.auth.getUserNotifications.invalidate();
      },
    });

  return (
    <div className="mt-3 flex gap-2">
      <button
        ref={buttonRef}
        className={`${
          notification.read
            ? "rounded border border-gray-700 px-3 py-1 font-normal text-gray-700 opacity-70"
            : "rounded border border-gray-700 px-3 py-1 font-normal text-gray-700 transition-all hover:border-slate-200 hover:bg-slate-200"
        }`}
        onClick={() => {
          markNotificationAsRead({ id: notification.id });
          closeMenu();
        }}
        disabled={!!notification.read}
      >
        Mark as read
      </button>
      <Link
        ref={linkRef}
        href={notification.link}
        className="rounded bg-secondary px-3 py-1 text-white transition-all hover:bg-secondary/80"
        onClick={() => {
          markNotificationAsRead({ id: notification.id });
          closeMenu();
        }}
      >
        {notification.action}
      </Link>
    </div>
  );
}
