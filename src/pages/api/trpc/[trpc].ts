import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "../../../env/server.mjs";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../server/trpc/router/_app";
import { NextRequest } from "next/server";
import {
  getAuth,
  type SignedInAuthObject,
  type SignedOutAuthObject,
} from "@clerk/nextjs/server";
import { db } from "@lib/db/index.js";

// // We're using the edge-runtime
export const config = {
  runtime: "edge",
};

// export API handler
// export default createNextApiHandler({
//   router: appRouter,
//   createContext,
//   onError:
//     env.NODE_ENV === "development"
//       ? ({ path, error }) => {
//           console.error(`❌ tRPC failed on ${path}: ${error}`);
//         }
//       : undefined,
// });

// export API handler
export default async function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: async () => {
      const auth = await getAuth(req);

      return {
        auth,
        db,
      };
    },
  });
}
