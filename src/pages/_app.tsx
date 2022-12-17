import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../utils/trpc";

import "../styles/globals.scss";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Navbar>
        <Component {...pageProps} />
      </Navbar>
      <Toaster position="top-right" />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
