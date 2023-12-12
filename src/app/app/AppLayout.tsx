"use client";

import Image from "next/image";
import Link from "next/link";
import { AiOutlineDollar } from "react-icons/ai";
import {
  MdHomeFilled,
  MdLogin,
  MdLogout,
  MdManageAccounts,
  MdNotifications,
  MdOutlineEditNote,
} from "react-icons/md";

import {
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@utils/trpc";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactElement, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import { AppRouter } from "src/server/trpc/router/_app";
import logo from "../../../public/FlockNerd-logo-v2.png";
import NotificationsList from "./NotificationsList";

type RouterOutput = inferRouterOutputs<AppRouter>;
type GetUserNotifications = RouterOutput["auth"]["getUserNotifications"];

// Top navbar
export default function AppLayout({
  children,
  initialNotifications,
}: {
  children: React.ReactNode;
  initialNotifications: GetUserNotifications;
}) {
  const { user } = useUser();

  const pathName = usePathname();
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const genericHamburgerLine = `h-[2px] w-[22px] my-[2.5px] rounded-full bg-[#FEF9F6] transition ease transform duration-300`;
  const links = [
    {
      icon: <MdHomeFilled className="mr-5 mt-[-3px] inline text-2xl" />,
      title: "My Flocks",
      path: "/app/flocks",
      onClick: () => setSideBarOpen(false),
    },
    {
      icon: <MdOutlineEditNote className="mr-5 mt-[-3px] inline text-2xl" />,
      title: "Logs",
      path: "/app/logs",
      onClick: () => setSideBarOpen(false),
    },
    {
      icon: <AiOutlineDollar className="mr-5 mt-[-3px] inline text-2xl" />,
      title: "Expenses",
      path: "/app/expenses",
      onClick: () => setSideBarOpen(false),
    },
    {
      icon: <MdManageAccounts className="mr-5 mt-[-3px] inline text-2xl" />,
      title: "Account Settings",
      path: "/app/settings",
      onClick: () => setSideBarOpen(false),
    },
  ];

  const notificationsButtonRef = useRef<HTMLButtonElement | null>(null);

  const focusNotificationsButton = () => {
    if (notificationsButtonRef.current) {
      notificationsButtonRef.current.focus();
    }
  };

  const { data: notifications } = trpc.auth.getUserNotifications.useQuery(
    undefined,
    {
      initialData: initialNotifications,
    },
  );

  return (
    <>
      <Toaster position="top-right" />
      <nav className="navbar z-30 h-[60px] pl-2 pr-3 lg:h-16 lg:pl-6">
        <ul>
          <li className="inline lg:hidden">
            <button
              id="menuButton"
              aria-haspopup="true"
              aria-expanded={sideBarOpen}
              aria-controls="sideNav"
              aria-label="Open mobile nav menu"
              className="group flex h-12 w-12 flex-col items-center justify-center rounded"
              onClick={() => {
                setSideBarOpen(!sideBarOpen);
              }}
            >
              <div
                className={`${genericHamburgerLine} ${
                  sideBarOpen
                    ? "translate-y-[7px] rotate-45 group-hover:opacity-100"
                    : "group-hover:opacity-100"
                }`}
              />
              <div
                className={`${genericHamburgerLine} ${
                  sideBarOpen ? "opacity-0" : "group-hover:opacity-100"
                }`}
              />
              <div
                className={`${genericHamburgerLine} ${
                  sideBarOpen
                    ? "-translate-y-[7px] -rotate-45 group-hover:opacity-100"
                    : "group-hover:opacity-100"
                }`}
              />
            </button>
          </li>
          <li className="hidden translate-x-2 cursor-pointer sm:translate-x-0 md:block">
            <Link href="/" aria-label="Go to the homepage">
              <span className="flex items-center">
                <Image
                  src={logo}
                  height="55"
                  alt="Flock Nerd logo the white outline of a chicken"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>

          {/* user is signed-in */}
          {user && (
            <>
              <li
                className={`mr-2 flex items-center gap-2 rounded transition-all`}
              >
                <button
                  ref={notificationsButtonRef}
                  aria-haspopup="true" // indicates that this button triggers a popover
                  aria-expanded={notificationsOpen} // indicates whether the popover is open or closed
                  aria-label={`Toggle notifications - ${notifications?.filter(
                    (not) => !not.read,
                  ).length} unread notifications`} // provides a descriptive name for the button
                  role="button"
                  type="button"
                  className={`animate__animated animate__fadeInRight relative cursor-pointer px-3 py-3 hover:bg-slate-400/10 ${
                    notificationsOpen ? "open" : ""
                  }`}
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                  }}
                >
                  <MdNotifications aria-hidden className="text-2xl" />
                  <div
                    className={`${
                      notifications?.length
                        ? notifications.filter((not) => !not.read).length > 0
                          ? "opacity-100"
                          : "opacity-0"
                        : "opacity-0"
                    } absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded bg-red-500 text-[0.6rem] font-bold text-white dark:border-gray-900`}
                  >
                    {notifications?.filter((not) => !not.read).length}
                  </div>
                </button>
                {/* <div className="user-name animate__animated animate__fadeInLeft hidden lg:block">
                  {user.fullName}
                </div> */}
                <UserButton
                  afterSignOutUrl="/"
                  userProfileMode="navigation"
                  userProfileUrl="/app/settings/"
                  appearance={{
                    elements: {
                      userButtonOuterIdentifier:
                        "text-white font-bold text-base ml-2",
                      userButtonPopoverCard:
                        "bg-[#FEF9F6] rounded-lg text-primary",
                      // userButtonTrigger: "ml-2 md:ml-1",
                      avatarBox: "h-9 w-9 lg:h-10 lg:w-10",
                      avatarImage: "border-2 border-white rounded-full",
                    },
                  }}
                />
              </li>
            </>
          )}

          {/* user is not signed-in */}
          {!user && (
            <li>
              <SignInButton>
                <button className="rounded border-2 bg-transparent px-2 py-2 pr-3 transition-all hover:bg-white hover:text-primary">
                  <MdLogin />
                  &nbsp;Sign in
                </button>
              </SignInButton>
            </li>
          )}
        </ul>
      </nav>
      <section
        className={
          sideBarOpen
            ? "h-full overflow-y-auto transition-all lg:ml-52 lg:h-full"
            : "h-full overflow-y-auto transition-all lg:ml-52 lg:h-full"
        }
      >
        {children}
      </section>
      <aside
        aria-label="Notifications menu"
        aria-hidden={!notificationsOpen}
        className={`fadeIn pb-safe fixed bottom-0 right-0 top-[60px] w-80 overflow-y-auto bg-[#FEF9F6] p-3 shadow-2xl transition-all lg:top-[65px] lg:pb-3 ${
          notificationsOpen ? "translate-x-0" : "translate-x-80"
        }`}
      >
        {notifications?.length ? (
          <NotificationsList
            notifications={notifications}
            notificationsOpen={notificationsOpen}
            closeMenu={() => {
              setNotificationsOpen(false);
              focusNotificationsButton();
            }}
          />
        ) : (
          <p>No notifications to display.</p>
        )}
      </aside>
      <aside
        className={
          sideBarOpen
            ? "fixed top-[60px] h-full w-52 overflow-y-auto bg-[#FEF9F6] shadow-2xl transition-transform lg:top-[65px] lg:h-full"
            : "fixed top-[60px] h-full w-52 -translate-x-52 overflow-y-auto bg-[#FEF9F6] shadow-lg transition-transform lg:top-[65px] lg:h-full lg:translate-x-0"
        }
      >
        <ul className="side-nav pt-7">
          {links.map((link, index) => {
            return <SidebarNavLink {...link} key={index} />;
          })}
          <li
            className={`mb-0 px-2 ${
              pathName == "/logout" ? "bg-gray-400 text-white" : ""
            } hover:text-gray-500`}
          >
            <SignOutButton>
              <button className="flex items-center px-2 py-3">
                <MdLogout className="ml-[2px] mr-[18.5px] inline text-2xl" />
                Logout
              </button>
            </SignOutButton>
          </li>
        </ul>
      </aside>
    </>
  );
}

function SidebarNavLink({
  icon,
  title,
  path,
  onClick,
}: {
  icon: ReactElement;
  title: string;
  path: string;
  onClick: () => void;
}) {
  const pathName = usePathname();
  return (
    <>
      {title == "Account Settings" && (
        <li className="mt-auto px-3">
          <div className="divider my-3 dark:border-t-gray-500"></div>
        </li>
      )}
      <li
        key={title}
        className={`mb-0 px-2 ${
          pathName?.startsWith(path) ? "text-white" : "hover:text-gray-500"
        } relative`}
        style={{
          transition: `color 0.2s ease-in-out ${
            pathName?.startsWith(path) ? "0.15s" : "0s"
          }`,
        }}
      >
        <Link
          href={path}
          className="relative z-10 flex items-center px-2 py-3"
          onClick={onClick}
        >
          <>
            {icon}
            {title}
          </>
        </Link>
        {/* <AnimatePresence mode="wait" initial={false}> */}
        {pathName?.startsWith(path) && (
          <motion.div
            layoutId="highlight"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="absolute left-0 top-0 z-0 h-full w-full origin-left bg-[#CD7660]"
          ></motion.div>
        )}
        {/* </AnimatePresence> */}
      </li>
    </>
  );
}
