import { type Notification } from "@prisma/client";
import { MdClose } from "react-icons/md";
import NotificationActionButtons from "./NotifcationActionButtons";

export default function NotificationsList({
  notifications,
  closeMenu,
}: {
  notifications: Notification[];
  closeMenu: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <button
        className="absolute top-3 right-3 flex items-center justify-center rounded p-1 transition-all hover:bg-slate-400/10"
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
              <NotificationActionButtons
                notification={not}
                closeMenu={closeMenu}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
