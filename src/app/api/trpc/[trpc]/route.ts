// import { createNextApiHandler } from "@trpc/server/adapters/next";

// import { env } from "../../../env/server.mjs";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@lib/db";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";
import { appRouter } from "src/server/trpc/router/_app";

// // We're using the edge-runtime
export const runtime = "edge";

// export API handler
async function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: async () => {
      const auth = await getAuth(req);

      console.log("auth: ", auth);

      return {
        auth,
        db,
      };
    },
    onError: ({ path, error }) => {
      console.error(`❌ tRPC failed on ${path}: ${error}`);
    },
  });
}

export { handler as DELETE, handler as GET, handler as POST, handler as PUT };
