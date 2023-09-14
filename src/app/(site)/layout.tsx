import Link from "next/link";
import Image from "next/image";
import { MdLogin } from "react-icons/md";
import logo from "../../../public/FlockNerd-logo-v2.png";
import {
  currentUser,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

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
          <SignedIn>
            {/* <li> */}
            {/* <Link href={"/app/flocks"}> */}
            {/* My Flocks */}
            {/* <li
                className={`ml-4 flex cursor-pointer items-center rounded px-3 py-1 transition-all hover:bg-slate-400/10`}
              >
                {user?.hasImage && (
                  <Image
                    src={user.imageUrl as string}
                    width="35"
                    height="35"
                    className="user-img h-9 w-9 lg:h-11 lg:w-11"
                    alt="Current user profile image"
                  />
                )}
              </li> */}
            {/* </Link> */}
            {/* </li> */}
            <li className="mr-2 flex items-center gap-2">
              <Link
                href={"/app/flocks"}
                className="animate__animated animate__fadeInRight px-3 py-2 hover:bg-slate-400/10"
              >
                <span className="flex items-center font-semibold">
                  My Flocks
                </span>
              </Link>
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
                    userButtonTrigger: "ml-2 md:ml-1",
                    avatarBox: "h-9 w-9 lg:h-10 lg:w-10",
                    avatarImage: "border-2 border-white rounded-full",
                  },
                }}
              />
            </li>
          </SignedIn>

          {/* user is not signed-in */}
          <SignedOut>
            <li>
              <SignInButton mode="modal" afterSignInUrl="/app/flocks/">
                <button className="rounded border-2 bg-transparent px-2 py-2 pr-3 transition-all hover:bg-white hover:text-primary">
                  <MdLogin />
                  &nbsp;Sign in
                </button>
              </SignInButton>
            </li>
          </SignedOut>
        </ul>
      </nav>
      <section className={"transition-all"}>{children}</section>
    </>
  );
}
