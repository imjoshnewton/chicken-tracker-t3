import { type Notification } from "@prisma/client";
import Link from "next/link";
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
    <>
      <ul className="flex-col">
        <h3 className="mb-1 self-start text-gray-800">Notifications</h3>
        {notifications.map((not) => {
          return (
            <li key={not.id} className="rounded bg-slate-200 p-3 text-gray-900">
              {/* <Link href={not.link}> */}
              <h4 className="mb-1">{not.title}</h4>
              <p className=" font-normal">{not.message}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded border border-gray-700 px-4 py-2 font-normal text-gray-700 transition-all hover:border-slate-200 hover:bg-slate-200"
                  onClick={() => {
                    markAsRead.mutate({ id: not.id });
                    closeMenu();
                  }}
                >
                  Mark as read
                </button>
                <Link
                  href={not.link}
                  className="rounded bg-secondary px-4 py-2 text-white transition-all hover:bg-secondary/80"
                  onClick={() => {
                    closeMenu();
                  }}
                >
                  {not.action}
                </Link>
              </div>
              {/* </Link> */}
            </li>
          );
        })}
      </ul>
    </>
  );
}
