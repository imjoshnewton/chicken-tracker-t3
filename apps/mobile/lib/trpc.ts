import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";

// Import AppRouter type from the web app
// In the monorepo, we reference it via the shared api package path
import type { AppRouter } from "../../packages/api/src/index";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Use environment variable for API URL
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (url) return url;
  // Default to localhost for development
  return "http://localhost:3002";
};

export function getTRPCClient(getToken: () => Promise<string | null>) {
  return trpc.createClient({
    links: [
      loggerLink({
        enabled: (opts) =>
          __DEV__ || (opts.direction === "down" && opts.result instanceof Error),
      }),
      httpBatchLink({
        transformer: superjson,
        url: `${getBaseUrl()}/api/trpc`,
        async headers() {
          const token = await getToken();
          return {
            Authorization: token ? `Bearer ${token}` : "",
          };
        },
      }),
    ],
  });
}
