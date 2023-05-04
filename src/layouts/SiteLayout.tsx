import Image from "next/image";
import Link from "next/link";

import {
  MdOutlineEditNote,
  MdLogout,
  MdHomeFilled,
  MdSettings,
  MdLogin,
} from "react-icons/md";
import { AiOutlineDollar } from "react-icons/ai";

import logo from "../../public/FlockNerd-logo-v2.png";
import { useState } from "react";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

// Top navbar
export default function SiteLayout({ children }: { children: any }) {
  const { data } = useSession();
  const router = useRouter();
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const genericHamburgerLine = `h-[2px] w-[22px] my-[2.5px] rounded-full bg-white transition ease transform duration-300`;

  return (
    <>
      <nav
        className={`navbar h-[60px] pl-2 lg:h-[65px] lg:pl-6 ${
          data?.user ? "pr-3" : "pr-6"
        }`}
      >
        <ul>
          <li className="inline lg:hidden">
            <button
              className="group flex h-12 w-12 flex-col items-center justify-center rounded"
              onClick={() => {
                setSideBarOpen(!sideBarOpen);
              }}
            >
              {/* <MdMenu className=' text-2xl' /> */}
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
          <li className="translate-x-2 cursor-pointer sm:translate-x-0">
            <Link href="/">
              <span className="flex items-center">
                {/* <span className="hidden sm:inline">Flock&nbsp;</span> */}
                <Image
                  src={logo}
                  height="55"
                  alt="Flock Nerd logo the white outline of a chicken"
                />
                {/* <span className="hidden sm:inline">&nbsp;Nerd</span> */}
              </span>
            </Link>
          </li>

          {/* user is signed-in */}
          {data?.user && (
            <>
              <li
                className={`multilink ml-4 flex cursor-pointer items-center rounded px-3 py-1 transition-all hover:bg-slate-400/10 ${
                  userMenuOpen ? "open" : ""
                }`}
                onClick={() => {
                  // setUserMenuOpen(!userMenuOpen);
                  router.push("/app/flocks");
                }}
              >
                {/* <div className="user-name mr-3 hidden lg:block">
                  {user.name}
                </div> */}
                {data.user.image && (
                  <Image
                    src={data.user.image as string}
                    width="35"
                    height="35"
                    className="user-img h-9 w-9 lg:h-11 lg:w-11"
                    alt="Current user profile image"
                  />
                )}
                <div
                  className={`multilink-content fadeIn top-16 right-2 bg-white p-2 shadow-xl`}
                >
                  <Link href={`/app/flocks/`} className="flex items-center">
                    <MdHomeFilled className="mr-3 mt-[-3px] inline text-xl" />
                    My Flocks
                  </Link>
                  <Link href="/api/auth/signout" className="flex items-center">
                    <MdLogout className="mr-3 inline text-xl" />
                    Logout
                  </Link>
                </div>
              </li>
            </>
          )}

          {/* user is not signed-in */}
          {!data?.user && (
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
      <section className={"transition-all"}>{children}</section>
      <aside
        className={
          sideBarOpen
            ? "fixed top-[60px] h-[calc(100vh_-_60px)] w-52 bg-gray-50 shadow-2xl transition-transform lg:top-[65px] lg:hidden lg:h-[calc(100vh_-_65px)]"
            : "fixed top-[60px] h-[calc(100vh_-_60px)] w-52 -translate-x-52 bg-gray-50 shadow-lg transition-transform lg:top-[65px] lg:hidden lg:h-[calc(100vh_-_65px)] lg:translate-x-0"
        }
      >
        {data?.user ? (
          <>
            <ul className="side-nav pt-7">
              <li
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
                  <MdOutlineEditNote className="mr-[14px] inline text-3xl" />{" "}
                  All Logs
                </Link>
              </li>
              <li
                className={`mb-0 px-2 ${
                  router.pathname == "/app/expenses"
                    ? "bg-gray-400 text-white"
                    : ""
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
              </li>
              <li className="mt-auto px-3">
                <div className="divider my-3 dark:border-t-gray-500"></div>
              </li>
              <li
                className={`mb-0 px-2 ${
                  router.pathname == "/app/settings"
                    ? "bg-gray-400 text-white"
                    : ""
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
              </li>
              <li
                className={`mb-0 px-2 ${
                  router.pathname == "/logout" ? "bg-gray-400 text-white" : ""
                } hover:bg-gray-300`}
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
          </>
        ) : (
          <>
            <ul className="side-nav pt-7">
              <li
                className={`mb-0 px-2 ${
                  router.pathname == "/signin" ? "bg-gray-400 text-white" : ""
                } hover:bg-gray-300`}
              >
                <Link
                  className="flex items-center px-2 py-3"
                  href="/api/auth/signin"
                  onClick={() => {
                    // signOut();
                    setSideBarOpen(false);
                  }}
                >
                  <MdLogout className="ml-[2px] mr-[18.5px] inline text-2xl" />
                  Sign in
                </Link>
              </li>
            </ul>
          </>
        )}
      </aside>
    </>
  );
}
