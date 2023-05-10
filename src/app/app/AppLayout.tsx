"use client";

import Image from "next/image";
import Link from "next/link";
// import { useUserData } from "../../lib/hooks";
import {
  MdOutlineEditNote,
  MdLogout,
  MdHomeFilled,
  MdSettings,
  MdLogin,
} from "react-icons/md";
import { AiOutlineDollar } from "react-icons/ai";

import logo from "../../../public/FlockNerd-logo-v2.png";
import { ReactElement, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
// import { trpc } from "../../utils/trpc";
// import Loader from "../../components/shared/Loader";
// import NotificationsList from "../../components/NotificationsList";
import { motion } from "framer-motion";
import { Session } from "next-auth";
import { Toaster } from "react-hot-toast";

// Top navbar
export default function AppLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const user = session?.user;
  // const {
  //   data: notifications,
  //   isLoading,
  //   isError,
  // } = trpc.auth.getUserNotifications.useQuery(undefined, {
  //   refetchInterval: 5 * 60 * 1000,
  // });
  const pathName = usePathname();
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const genericHamburgerLine = `h-[2px] w-[22px] my-[2.5px] rounded-full bg-white transition ease transform duration-300`;
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
      icon: <MdSettings className="mr-5 mt-[-3px] inline text-2xl" />,
      title: "Settings",
      path: "/app/settings",
      onClick: () => setSideBarOpen(false),
    },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <nav className="navbar h-[60px] pr-3 pl-2 lg:h-[65px] lg:pl-6">
        <ul>
          <li className="inline lg:hidden">
            <button
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
            <Link href="/">
              <span className="flex items-center">
                <Image
                  src={logo}
                  height="55"
                  alt="Flock Nerd logo the white outline of a chicken"
                />
              </span>
            </Link>
          </li>

          {/* user is signed-in */}
          {user && (
            <>
              <li
                className={`multilink ml-4 flex cursor-pointer items-center rounded px-3 py-1 transition-all hover:bg-slate-400/10 ${
                  notificationsOpen ? "open" : ""
                }`}
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                }}
              >
                <div className="user-name animate__animated animate__fadeInLeft mr-3 hidden lg:block">
                  {user.name}
                </div>
                {user.image && (
                  <div
                  // className="animate__animated animate__fadeInRight"
                  // style={{ animationDelay: "0.25s" }}
                  >
                    <Image
                      src={user.image as string}
                      width="35"
                      height="35"
                      className="user-img h-9 w-9 lg:h-11 lg:w-11"
                      alt="Current user profile image"
                    />
                    {/* <div
                      className={`${
                        notifications?.length
                          ? notifications.filter((not) => !not.read).length > 0
                            ? "opacity-100"
                            : "opacity-0"
                          : "opacity-0"
                      } absolute top-1 right-3 inline-flex h-5 w-5 items-center justify-center rounded bg-red-500 text-[0.6rem] font-bold text-white dark:border-gray-900`}
                    >
                      {notifications?.filter((not) => !not.read).length}
                    </div> */}
                  </div>
                )}
              </li>
            </>
          )}

          {/* user is not signed-in */}
          {!user && (
            <li>
              <Link href="/api/auth/signin">
                <button className="rounded border-2 bg-transparent py-2 px-2 pr-3 transition-all hover:bg-white hover:text-primary">
                  <MdLogin />
                  &nbsp;Sign in
                </button>
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <section
        className={
          sideBarOpen
            ? "h-[calc(100vh_-_60px)] transition-all lg:ml-52 lg:h-[calc(100vh_-_65px)]"
            : "h-[calc(100vh_-_60px)] transition-all lg:ml-52 lg:h-[calc(100vh_-_65px)]"
        }
      >
        {children}
      </section>
      {/* <aside
        className={`fadeIn pb-safe fixed right-0 top-[60px] h-[calc(100vh_-_60px)] w-80 bg-white p-3 shadow-2xl transition-all lg:top-[65px] lg:h-[calc(100vh_-_65px)] lg:pb-3 ${
          notificationsOpen ? "translate-x-0" : "translate-x-80"
        }`}
      >
        {isLoading ? (
          <Loader show={true} />
        ) : isError ? (
          <p>Error loading notifications.</p>
        ) : notifications.length ? (
          <NotificationsList
            notifications={notifications}
            closeMenu={() => setNotificationsOpen(false)}
          />
        ) : (
          <p>Error loading notifications.</p>
        )}
      </aside> */}
      <aside
        className={
          sideBarOpen
            ? "fixed top-[60px] h-[calc(100vh_-_60px)] w-52 bg-white shadow-2xl transition-transform lg:top-[65px] lg:h-[calc(100vh_-_65px)]"
            : "fixed top-[60px] h-[calc(100vh_-_60px)] w-52 -translate-x-52 bg-white shadow-lg transition-transform lg:top-[65px] lg:h-[calc(100vh_-_65px)] lg:translate-x-0"
        }
      >
        <ul className="side-nav pt-7">
          {links.map((link, index) => {
            return <SidebarNavLink {...link} key={index} />;
          })}
          {/* <li
            className={`mb-0 px-2 ${
              router.pathname.startsWith("/app/flocks")
                ? "bg-gray-400 text-white"
                : ""
            } hover:bg-gray-300`}
          >
            <Link
              href={`/app/flocks/`}
              className="flex items-center px-2 py-3"
              onClick={() => {
                setSideBarOpen(false);
              }}
            >
              <MdHomeFilled className="mr-5 mt-[-3px] inline text-2xl" />
              My Flocks
            </Link>
          </li>
          <li
            className={`mb-0 px-2 ${
              router.pathname == "/app/logs" ? "bg-gray-400 text-white" : ""
            } hover:bg-gray-300`}
          >
            <Link
              href={`/app/logs`}
              className="flex items-center px-2 py-3"
              onClick={() => {
                setSideBarOpen(false);
              }}
            >
              <MdOutlineEditNote className="mr-[14px] inline text-3xl" /> All
              Logs
            </Link>
          </li>
          <li
            className={`mb-0 px-2 ${
              router.pathname == "/app/expenses" ? "bg-gray-400 text-white" : ""
            } hover:bg-gray-300`}
          >
            <Link
              href={`/app/expenses`}
              className="flex items-center px-2 py-3"
              onClick={() => {
                setSideBarOpen(false);
              }}
            >
              <AiOutlineDollar className="mr-5 mt-[-3px] inline text-2xl" />
              All Expenses
            </Link>
          </li> */}
          {/* <li className="mt-auto px-3">
            <div className="divider my-3 dark:border-t-gray-500"></div>
          </li> */}
          {/* <li
            className={`mb-0 px-2 ${
              router.pathname == "/app/settings" ? "bg-gray-400 text-white" : ""
            } hover:bg-gray-300`}
          >
            <Link
              href="/app/settings"
              className="flex items-center px-2 py-3"
              onClick={() => {
                setSideBarOpen(false);
              }}
            >
              <MdSettings className="mr-5 inline text-2xl" />
              Settings
            </Link>
          </li> */}
          <li
            className={`mb-0 px-2 ${
              pathName == "/logout" ? "bg-gray-400 text-white" : ""
            } hover:text-gray-500`}
          >
            <button
              className="flex items-center px-2 py-3"
              onClick={() => {
                signOut();
                setSideBarOpen(false);
              }}
            >
              <MdLogout className="ml-[2px] mr-[18.5px] inline text-2xl" />
              Logout
            </button>
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
      {title == "Settings" && (
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
            className="absolute left-0 top-0 z-0 h-full w-full origin-left bg-gray-400"
          ></motion.div>
        )}
        {/* </AnimatePresence> */}
      </li>
    </>
  );
}
