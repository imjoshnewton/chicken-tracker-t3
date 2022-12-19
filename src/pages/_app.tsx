import { type AppProps } from "next/app";
// import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../utils/trpc";

import "../styles/globals.scss";
import { Toaster } from "react-hot-toast";
import type { ReactElement, ReactNode } from "react";
import { type NextPage } from "next";

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const layout = getLayout(<Component {...pageProps} />);

  return (
    <SessionProvider session={session}>
      {layout}
      <Toaster position="top-right" />
    </SessionProvider>
  );
}

export default trpc.withTRPC(MyApp);

// const MyApp: AppType<{ session: Session | null }> = ({
//   Component,
//   pageProps: { session, ...pageProps },
// }) => {
//   return (
//     <SessionProvider session={session}>
//       <Navbar>
//         <Component {...pageProps} />
//       </Navbar>

//     </SessionProvider>
//   );
// };

// export default trpc.withTRPC(MyApp);
