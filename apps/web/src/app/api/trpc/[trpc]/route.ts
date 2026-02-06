import { getAuth } from "@clerk/nextjs/server";
import { verifyToken } from "@clerk/backend";
import { db } from "@lib/db";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest, NextResponse } from "next/server";
import { appRouter } from "src/server/trpc/router/_app";

export const preferredRegion = "auto";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

async function getAuthFromRequest(req: NextRequest) {
  // Check for Bearer token (mobile app)
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      console.log("verifyToken result:", JSON.stringify({ sub: payload?.sub, iss: payload?.iss }));
      if (payload?.sub) {
        return { userId: payload.sub };
      }
      console.error("verifyToken returned payload without sub:", payload);
      return { userId: null };
    } catch (error) {
      console.error("verifyToken error:", error instanceof Error ? error.message : error);
      return { userId: null };
    }
  }
  // Fall back to cookie-based auth (web app)
  const auth = await getAuth(req);
  return auth;
}

async function handler(req: NextRequest) {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: async () => {
      const auth = await getAuthFromRequest(req);
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
