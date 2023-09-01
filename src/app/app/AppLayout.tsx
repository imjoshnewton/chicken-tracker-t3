"use client";

import Image from "next/image";
import Link from "next/link";
import { AiOutlineDollar } from "react-icons/ai";
import {
  MdHomeFilled,
  MdLogin,
  MdLogout,
  MdOutlineEditNote,
  MdSettings,
} from "react-icons/md";

import { SignOutButton, useUser } from "@clerk/nextjs";
import type { Notification } from "@prisma/client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactElement, useState } from "react";
import { Toaster } from "react-hot-toast";
import logo from "../../../public/FlockNerd-logo-v2.png";
import NotificationsList from "./NotificationsList";

// Top navbar
export default function AppLayout({
  children,
  notifications,
}: {
  children: React.ReactNode;
  notifications: Notification[] | undefined;
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
      icon: <MdSettings className="mr-5 mt-[-3px] inline text-2xl" />,
      title: "Settings",
      path: "/app/settings",
      onClick: () => setSideBarOpen(false),
    },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <nav className="navbar z-30 h-[60px] pl-2 pr-3 lg:h-[65px] lg:pl-6">
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
                  {user.fullName}
                </div>
                {user.hasImage && (
                  <div>
                    <Image
                      src={user.imageUrl as string}
                      width="35"
                      height="35"
                      className="user-img h-9 w-9 lg:h-11 lg:w-11"
                      alt="Current user profile image"
                    />
                    <div
                      className={`${
                        notifications?.length
                          ? notifications.filter((not) => !not.read).length > 0
                            ? "opacity-100"
                            : "opacity-0"
                          : "opacity-0"
                      } absolute right-3 top-1 inline-flex h-5 w-5 items-center justify-center rounded bg-red-500 text-[0.6rem] font-bold text-white dark:border-gray-900`}
                    >
                      {notifications?.filter((not) => !not.read).length}
                    </div>
                  </div>
                )}
              </li>
            </>
          )}

          {/* user is not signed-in */}
          {!user && (
            <li>
              <Link href="/api/auth/signin">
                <button className="rounded border-2 bg-transparent px-2 py-2 pr-3 transition-all hover:bg-white hover:text-primary">
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
            ? "h-full overflow-y-auto transition-all lg:ml-52 lg:h-full"
            : "h-full overflow-y-auto transition-all lg:ml-52 lg:h-full"
        }
      >
        {children}
      </section>
      <aside
        className={`fadeIn pb-safe fixed bottom-0 right-0 top-[60px] w-80 overflow-y-auto bg-[#FEF9F6] p-3 shadow-2xl transition-all lg:top-[65px] lg:pb-3 ${
          notificationsOpen ? "translate-x-0" : "translate-x-80"
        }`}
      >
        {notifications?.length ? (
          <NotificationsList
            notifications={notifications}
            closeMenu={() => setNotificationsOpen(false)}
          />
        ) : (
          <p>Error loading notifications.</p>
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
            className="absolute left-0 top-0 z-0 h-full w-full origin-left bg-[#CD7660]"
          ></motion.div>
        )}
        {/* </AnimatePresence> */}
      </li>
    </>
  );
}
