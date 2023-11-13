import { type Notification } from "@lib/db/schema";
import { MdClose } from "react-icons/md";
import NotificationActionButtons from "./NotifcationActionButtons";

export default function NotificationsList({
  notifications,
  closeMenu,
  notificationsOpen,
}: {
  notifications: Notification[];
  closeMenu: () => void;
  notificationsOpen: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <button
        aria-hidden={!notificationsOpen}
        aria-label="Close notifications menu"
        role="button"
        className="absolute right-3 top-3 flex items-center justify-center rounded p-1 transition-all hover:bg-slate-400/10"
        onClick={closeMenu}
      >
        <MdClose aria-hidden className="text-xl" />
      </button>
      <h3 className="mb-0 self-start text-lg font-semibold text-gray-800">
        Notifications
      </h3>
      <ul className="flex flex-col gap-2 overflow-y-scroll" aria-live="polite">
        {notifications.map((not, index) => {
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
                isOpen={notificationsOpen}
                index={index}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
