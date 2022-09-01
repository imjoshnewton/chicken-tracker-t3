import Image from "next/image";
import Link from "next/link";
import { useUserData } from "../libs/hooks";

import {
  MdOutlineEditNote,
  MdLogout,
  MdHomeFilled,
  MdMenu,
} from "react-icons/md";
import { AiOutlineDollar } from "react-icons/ai";

import logo from "../../public/chicken.svg";
import { useState } from "react";

// Top navbar
export default function Navbar({ children }: { children: any }) {
  const { user, defaultFlock } = useUserData();
  const [sideBarOpen, setSideBarOpen] = useState(false);

  return (
    <>
      <nav className='navbar h-[60px] md:h-[65px] pr-5 pl-1 md:px-6'>
        <ul>
          <li className='inline md:hidden'>
            <button
              onClick={() => {
                setSideBarOpen(!sideBarOpen);
              }}>
              <MdMenu className=' text-2xl' />
            </button>
          </li>
          <li className='cursor-pointer'>
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
                <div className='mr-3 user-name hidden md:block'>
                  {user.name}
                </div>
                {user.image && (
                  <img
                    src={user.image as string}
                    width='35'
                    height='35'
                    className='h-9 md:h-11 w-9 md:w-11'
                    alt='Current user profile image'
                  />
                )}
                {/* </Link> */}
                <div className='multilink-content fadeIn top-16 right-2 md:right-auto'>
                  <Link href={`/flocks/`}>
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
                  </Link>
                  <Link href='/api/auth/signout'>
                    <a className='flex items-center'>
                      <MdLogout className='mr-3 inline text-xl' />
                      Logout
                    </a>
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
          sideBarOpen ? "md:ml-52 transition-all" : "md:ml-52 transition-all"
        }>
        {children}
      </section>
      <aside
        className={
          sideBarOpen
            ? "h-[calc(100vh_-_60px)] md:h-[calc(100vh_-_65px)] fixed top-[60px] w-52 bg-gray-300 transition-transform shadow-xl"
            : "-translate-x-52 md:translate-x-0 h-[calc(100vh_-_60px)] md:h-[calc(100vh_-_65px)] fixed top-[60px] w-52 bg-gray-300 transition-transform shadow-lg"
        }>
        <ul className='p-4 pt-7 side-nav'>
          <li className='mb-0'>
            <Link href={`/flocks/`}>
              <a className='flex items-center'>
                <MdHomeFilled className='mr-5 inline text-2xl mt-[-3px]' />
                My Flocks
              </a>
            </Link>
          </li>
          <li className='mb-0'>
            <Link href={`/logs`}>
              <a className='flex items-center'>
                <MdOutlineEditNote className='mr-[10px] inline text-3xl' /> All
                Logs
              </a>
            </Link>
          </li>
          <li className='mb-0'>
            <Link href={`/expenses`}>
              <a className='flex items-center'>
                <AiOutlineDollar className='mr-5 inline text-2xl mt-[-3px]' />
                All Expenses
              </a>
            </Link>
          </li>
          <li className='mb-0'>
            <Link href='/api/auth/signout'>
              <a className='flex items-center'>
                <MdLogout className='mr-5 inline text-2xl' />
                Logout
              </a>
            </Link>
          </li>
        </ul>
      </aside>
    </>
  );
}
