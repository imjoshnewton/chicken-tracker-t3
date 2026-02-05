import { getAuth } from "@clerk/nextjs/server";
import { db } from "@lib/db";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest, NextResponse } from "next/server";
import { appRouter } from "src/server/trpc/router/_app";

export const runtime = "edge";
export const preferredRegion = "auto";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

async function handler(req: NextRequest) {
  const response = await fetchRequestHandler({
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
    onError: ({ path, error }) => {
      console.error(`❌ tRPC failed on ${path}: ${error}`);
    },
  });

  // Add CORS headers to the response
  const headers = corsHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export { handler as DELETE, handler as GET, handler as POST, handler as PUT };
