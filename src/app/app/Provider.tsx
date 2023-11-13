"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { getBaseUrl, trpcReact } from "@utils/trpc";
import { useState } from "react";
import superjson from "superjson";

export const TrpcProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5000 } },
      }),
  );

  const url = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000/api/trpc/";

  const [trpcClient] = useState(() =>
    trpcReact.createClient(
      {
        transformer: superjson,
        links: [
          loggerLink({
            enabled: (opts) =>
              process.env.NODE_ENV === "development" ||
              (opts.direction === "down" && opts.result instanceof Error),
          }),
          httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
          }),
        ],
      },
      //     {
      //   links: [
      //     loggerLink({
      //       enabled: () => true,
      //     }),
      //     httpBatchLink({
      //       url,
      //       fetch: async (input, init?) => {
      //         const fetch = getFetch();
      //         return fetch(input, {
      //           ...init,
      //           credentials: "include",
      //         });
      //       },
      //     }),
      //   ],
      //   transformer: superjson,
      // }
    ),
  );
  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* <ReactQueryDevtools /> */}
      </QueryClientProvider>
    </trpcReact.Provider>
  );
};
