import Link from "next/link";
import Image from "next/image";
import { MdLogin } from "react-icons/md";
import logo from "../../../public/FlockNerd-logo-v2.png";
import { currentUser, SignInButton } from "@clerk/nextjs";

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

  return (
    <>
      <nav
        className={`navbar z-50 h-[60px] pl-2 lg:h-[65px] lg:pl-6 ${
          user ? "pr-3" : "pr-6"
        }`}
      >
        <ul>
          <li className="translate-x-2 cursor-pointer sm:translate-x-0">
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
            <Link href={"/app/flocks"}>
              <li
                className={`multilink ml-4 flex cursor-pointer items-center rounded px-3 py-1 transition-all hover:bg-slate-400/10`}
              >
                {user.hasImage && (
                  <Image
                    src={user.imageUrl as string}
                    width="35"
                    height="35"
                    className="user-img h-9 w-9 lg:h-11 lg:w-11"
                    alt="Current user profile image"
                  />
                )}
              </li>
            </Link>
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
      <section className={"transition-all"}>{children}</section>
    </>
  );
}
