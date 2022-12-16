"use client";

import Image from "next/image";
import Link from "next/link";
import { useUserData } from "../libs/hooks";

import {
  MdOutlineEditNote,
  MdLogout,
  MdHomeFilled,
  MdSettings,
} from "react-icons/md";
import { AiOutlineDollar } from "react-icons/ai";

import logo from "../../public/chicken.svg";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

// Top navbar
export default function Navbar({ children }: { children: any }) {
  const { user } = useUserData();
  // const router = useRouter();
  const pathname = usePathname();
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const genericHamburgerLine = `h-[2px] w-[22px] my-[2.5px] rounded-full bg-white transition ease transform duration-300`;

  // console.log("Router: ", router);

  return (
    <>
      <nav className='navbar h-[60px] lg:h-[65px] pr-5 pl-2 lg:px-6'>
        <ul>
          <li className='inline lg:hidden'>
            <button
              className='flex flex-col h-12 w-12 rounded justify-center items-center group'
              onClick={() => {
                setSideBarOpen(!sideBarOpen);
              }}>
              {/* <MdMenu className=' text-2xl' /> */}
              <div
                className={`${genericHamburgerLine} ${
                  sideBarOpen
                    ? "rotate-45 translate-y-[7px] group-hover:opacity-100"
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
                    ? "-rotate-45 -translate-y-[7px] group-hover:opacity-100"
                    : "group-hover:opacity-100"
                }`}
              />
            </button>
          </li>
          <li className='cursor-pointer translate-x-2 sm:translate-x-0'>
            <Link href='/'>
              <span className='flex items-center'>
                <span className='hidden sm:inline'>Chicken&nbsp;</span>
                <Image
                  src={logo}
                  width='40'
                  height='40'
                  alt='Chicken tracker logo the white outline of a chicken'
                />
                <span className='hidden sm:inline'>&nbsp;Tracker</span>
              </span>
            </Link>
          </li>

          {/* user is signed-in */}
          {user && (
            <>
              <li className='ml-4 flex items-center multilink cursor-pointer'>
                <div className='mr-3 user-name hidden lg:block'>
                  {user.name}
                </div>
                {user.image && (
                  <img
                    src={user.image as string}
                    width='35'
                    height='35'
                    className='h-9 lg:h-11 w-9 lg:w-11 user-img'
                    alt='Current user profile image'
                  />
                )}
                {/* </Link> */}
                <div className='multilink-content fadeIn top-16 right-2 lg:right-auto'>
                  {/* <Link href={`/flocks/`}>
                    <a className='flex items-center'>
                      <MdHomeFilled className='mr-3 inline text-xl mt-[-3px]' />
                      My Flocks
                    </a>
                  </Link>
                  <Link href={`/logs`}>
                    <a className='flex items-center'>
                      <MdOutlineEditNote className='mr-1 inline text-2xl' /> All
                      Logs
                    </a>
                  </Link>
                  <Link href={`/expenses`}>
                    <a className='flex items-center'>
                      <AiOutlineDollar className='mr-3 inline text-xl mt-[-3px]' />
                      All Expenses
                    </a>
                  </Link> */}
                  <Link href='/api/auth/signout' className='flex items-center'>
                    <MdLogout className='mr-3 inline text-xl' />
                    Logout
                  </Link>
                </div>
              </li>
            </>
          )}

          {/* user is not signed-in */}
          {!user && (
            <li>
              <Link href='/api/auth/signin'>
                <button className='btn p-4'>Log in</button>
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <section
        className={
          sideBarOpen ? "lg:ml-52 transition-all" : "lg:ml-52 transition-all"
        }>
        {children}
      </section>
      <aside
        className={
          sideBarOpen
            ? "h-[calc(100vh_-_60px)] lg:h-[calc(100vh_-_65px)] fixed top-[60px] w-52 bg-gray-50 transition-transform shadow-2xl"
            : "-translate-x-52 lg:translate-x-0 h-[calc(100vh_-_60px)] lg:h-[calc(100vh_-_65px)] fixed top-[60px] w-52 bg-gray-50 transition-transform shadow-lg"
        }>
        {/* {pathname} */}
        <ul className='pt-7 side-nav'>
          <li
            className={`mb-0 px-2 ${
              pathname?.startsWith("/flocks") ? "bg-gray-400 text-white" : ""
            } hover:bg-gray-300`}>
            <Link
              href={`/flocks/`}
              className='flex items-center px-2 py-3'
              onClick={() => {
                setSideBarOpen(false);
              }}>
              <MdHomeFilled className='mr-5 inline text-2xl mt-[-3px]' />
              My Flocks
            </Link>
          </li>
          <li
            className={`mb-0 px-2 ${
              pathname == "/logs" ? "bg-gray-400 text-white" : ""
            } hover:bg-gray-300`}>
            <Link
              href={`/logs`}
              className='flex items-center px-2 py-3'
              onClick={() => {
                setSideBarOpen(false);
              }}>
              <MdOutlineEditNote className='mr-[14px] inline text-3xl' /> All
              Logs
            </Link>
          </li>
          <li
            className={`mb-0 px-2 ${
              pathname == "/expenses" ? "bg-gray-400 text-white" : ""
            } hover:bg-gray-300`}>
            <Link
              href={`/expenses`}
              className='flex items-center px-2 py-3'
              onClick={() => {
                setSideBarOpen(false);
              }}>
              <AiOutlineDollar className='mr-5 inline text-2xl mt-[-3px]' />
              All Expenses
            </Link>
          </li>
          <li className='mt-auto px-3'>
            <div className='divider my-3 dark:border-t-gray-500'></div>
          </li>
          <li
            className={`mb-0 px-2 ${
              pathname == "/settings" ? "bg-gray-400 text-white" : ""
            } hover:bg-gray-300`}>
            <Link
              href='/settings'
              className='flex items-center px-2 py-3'
              onClick={() => {
                setSideBarOpen(false);
              }}>
              <MdSettings className='mr-5 inline text-2xl' />
              Settings
            </Link>
          </li>
          <li
            className={`mb-0 px-2 ${
              pathname == "/logout" ? "bg-gray-400 text-white" : ""
            } hover:bg-gray-300`}>
            <button
              className='flex items-center px-2 py-3'
              onClick={() => {
                signOut();
                setSideBarOpen(false);
              }}>
              <MdLogout className='ml-[2px] mr-[18.5px] inline text-2xl' />
              Logout
            </button>
          </li>
        </ul>
      </aside>
    </>
  );
}
