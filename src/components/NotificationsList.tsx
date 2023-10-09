import { type Notification } from "@lib/db/schema";
import Link from "next/link";
import { MdClose } from "react-icons/md";
import { trpc } from "../utils/trpc";

export default function NotificationsList({
  notifications,
  closeMenu,
}: {
  notifications: Notification[];
  closeMenu: () => void;
}) {
  const utils = trpc.useContext();

  const markAsRead = trpc.auth.markNotificationasRead.useMutation({
    onSuccess(data, variables, context) {
      utils.auth.getUserNotifications.invalidate();
    },
  });

  return (
    <div className="flex h-full flex-col">
      <button
        className="absolute right-3 top-3 flex items-center justify-center rounded p-1 transition-all hover:bg-slate-400/10"
        onClick={closeMenu}
      >
        <MdClose className="text-xl" />
      </button>
      <h3 className="mb-0 self-start text-lg font-semibold text-gray-800">
        Notifications
      </h3>
      <ul className="flex flex-col gap-2 overflow-y-scroll">
        {notifications.map((not) => {
          return (
            <li
              key={not.id}
              className={`w-full rounded p-3 text-gray-900 ${
                not.read
                  ? "bg-slate-200/50 opacity-60"
                  : "bg-slate-200 opacity-100"
              }`}
            >
              <h4 className="mb-1 text-sm font-semibold">{not.title}</h4>
              <p className="text-sm">{not.message}</p>
              <div className="mt-3 flex gap-2">
                <button
                  className={`${
                    not.read
                      ? "rounded border border-gray-700 px-3 py-1 font-normal text-gray-700 opacity-70"
                      : "rounded border border-gray-700 px-3 py-1 font-normal text-gray-700 transition-all hover:border-slate-200 hover:bg-slate-200"
                  }`}
                  onClick={() => {
                    markAsRead.mutate({ id: not.id });
                    closeMenu();
                  }}
                  disabled={!!not.read}
                >
                  Mark as read
                </button>
                <Link
                  href={not.link}
                  className="rounded bg-secondary px-3 py-1 text-white transition-all hover:bg-secondary/80"
                  onClick={() => {
                    markAsRead.mutate({ id: not.id });
                    closeMenu();
                  }}
                >
                  {not.action}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
