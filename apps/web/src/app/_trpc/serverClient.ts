// Direct import without types
import { auth } from "@clerk/nextjs/server";

import { db } from "@lib/db";
import { appRouter } from "src/server/trpc/router/_app";

export function getServerClient(
  authObj: any,
) {
  const serverClient = appRouter.createCaller({
    auth: authObj,
    db,
  });

  return serverClient;
}
