import Image from "next/image";
import Link from "next/link";
import { useUserData } from "../libs/hooks";

import { MdOutlineEditNote, MdLogout, MdHomeFilled } from "react-icons/md";
import { AiOutlineDollar } from "react-icons/ai";

import logo from "../../public/chicken.svg";

// Top navbar
export default function Navbar() {
  const { user, defaultFlock } = useUserData();

  return (
    <nav className='navbar'>
      <ul>
        <li className='cursor-pointer'>
          <Link href='/'>
            <span className='flex items-center'>
              Chicken&nbsp;
              <Image
                src={logo}
                width='40'
                height='40'
                alt='Chicken tracker logo'
              />
              &nbsp;Tracker
            </span>
          </Link>
        </li>

        {/* user is signed-in */}
        {user && (
          <>
            <li className='ml-4 flex items-center multilink cursor-pointer'>
              <div className='mr-3 user-name'>{user.name}</div>
              <img
                src={user.image as string}
                width='40'
                height='40'
                alt='Current user profile image'
              />
              {/* </Link> */}
              <div className='multilink-content fadeIn'>
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
  );
}
