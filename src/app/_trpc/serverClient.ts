import {
  type SignedInAuthObject,
  type SignedOutAuthObject,
} from "@clerk/nextjs/server";
import { db } from "@lib/db";
import { appRouter } from "src/server/trpc/router/_app";

export function getServerClient(
  auth: SignedInAuthObject | SignedOutAuthObject,
) {
  const serverClient = appRouter.createCaller({
    auth,
    db,
  });

  return serverClient;
}
