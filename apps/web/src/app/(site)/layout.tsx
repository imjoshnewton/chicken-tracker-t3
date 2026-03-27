import Link from "next/link";
import Image from "next/image";
import { MdLogin } from "react-icons/md";
import logo from "../../../public/FlockNerd-logo-v2.png";
import { currentUser } from "@clerk/nextjs/server";

import { AccountMenu } from "@components/auth/AccountMenu";



export const metadata = {
  title: "FlockNerd - Egg-ceptional Insights",
  description: "Flock Stats for Nerds",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const navItemClass =
    "rounded px-3 py-2 font-semibold transition-all hover:bg-slate-400/10";

  return (
    <>
      <nav
        className={`navbar z-50 h-[60px] pl-2 lg:h-[65px] lg:pl-6 ${
          user ? "pr-3" : "pr-6"
        }`}
      >
        <ul>
          <li>
            <Link href="/" className="translate-x-2 sm:translate-x-0">
              <span className="flex items-center">
                <Image
                  src={logo}
                  height="55"
                  alt="Flock Nerd logo the white outline of a chicken"
                />
              </span>
            </Link>
          </li>

          <li>
            {user ? (
              <div className="mr-2 flex items-center gap-2">
                <Link href="/about" className={navItemClass}>
                  About
                </Link>
                <Link href="/blog" className={navItemClass}>
                  Blog
                </Link>
                <Link
                  href="/app/flocks"
                  className={`animate__animated animate__fadeInRight ${navItemClass}`}
                >
                  <span className="flex items-center">My Flocks</span>
                </Link>
                <AccountMenu showName />
              </div>
            ) : (

              <div className="mr-2 flex items-center gap-2">
                <Link href="/about" className={navItemClass}>
                  About
                </Link>
                <Link href="/blog" className={navItemClass}>
                  Blog
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center rounded border-2 bg-transparent px-2 py-2 pr-3 transition-all hover:bg-white hover:text-primary"
                >
                  <MdLogin />
                  &nbsp;Sign in
                </Link>
              </div>
            )}
          </li>
        </ul>
      </nav>
      <section className={"transition-all"}>{children}</section>
    </>
  );
}
