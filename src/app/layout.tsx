import Link from "next/link";
import Image from "next/image";
import "../styles/globals.scss";
import { getServerSession } from "next-auth";
import { MdLogin } from "react-icons/md";
import logo from "../../public/FlockNerd-logo-v2.png";
import { authOptions } from "../pages/api/auth/[...nextauth]";
// import { useRouter } from "next/router";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getServerSession(authOptions);

  console.log("RootLayout data: ", data);

  return (
    <html>
      <head>
        <title>FlockNerd - Egg-ceptional Insights</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#264653" />
        <link rel="apple-touch-icon" href="/apple-icon-180.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta name="apple-mobile-web-app-capable" content="yes" />

        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-2048-2732.jpg"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-2732-2048.jpg"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1668-2388.jpg"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-2388-1668.jpg"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1536-2048.jpg"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-2048-1536.jpg"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1668-2224.jpg"
          media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-2224-1668.jpg"
          media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1620-2160.jpg"
          media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-2160-1620.jpg"
          media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1284-2778.jpg"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-2778-1284.jpg"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1170-2532.jpg"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-2532-1170.jpg"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1125-2436.jpg"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-2436-1125.jpg"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1242-2688.jpg"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-2688-1242.jpg"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-828-1792.jpg"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1792-828.jpg"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1242-2208.jpg"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-2208-1242.jpg"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-750-1334.jpg"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1334-750.jpg"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-640-1136.jpg"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1136-640.jpg"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
        />
      </head>
      <body>
        <nav
          className={`navbar h-[60px] pl-2 lg:h-[65px] lg:pl-6 ${
            data?.user ? "pr-3" : "pr-6"
          }`}
        >
          <ul>
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
              <Link href={"/app/flocks"}>
                <li
                  className={`multilink ml-4 flex cursor-pointer items-center rounded px-3 py-1 transition-all hover:bg-slate-400/10`}
                  // onClick={() => {
                  // setUserMenuOpen(!userMenuOpen);
                  // router.push("/app/flocks");
                  // }}
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
                  {/* <div
                    className={`multilink-content fadeIn top-16 right-2 bg-white p-2 shadow-xl`}
                  >
                    <Link href={`/app/flocks/`} className="flex items-center">
                      <MdHomeFilled className="mr-3 mt-[-3px] inline text-xl" />
                      My Flocks
                    </Link>
                    <Link
                      href="/api/auth/signout"
                      className="flex items-center"
                    >
                      <MdLogout className="mr-3 inline text-xl" />
                      Logout
                    </Link>
                  </div> */}
                </li>
              </Link>
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
      </body>
    </html>
  );
}
