import { NextRequest, NextResponse } from "next/server";

// Firebase Admin is not compatible with Edge runtime
// We'll create a mock handler for now, and implement it later
// with a solution that works in Edge - possibly through a separate API
// that runs on Node.js runtime or via Upstash

async function handler(req: NextRequest) {
  // For now, we'll just return a success message
  // The real implementation will need to be moved to a Node.js API route
  // or to a server-side function that can access Firebase Admin
  
  console.log("Summary cleanup called - would clean up files in Firebase storage if we were using Node.js runtime");
  
  // Return mock success
  return NextResponse.json(
    { 
      message: "Mock cleanup successful. Note: This is currently disabled in Edge runtime",
      info: "Firebase Admin is not compatible with Edge runtime. Will need to implement via Node.js API or Upstash"
    },
    { status: 200 },
  );
}

// Next.js 15 compatible handler
export async function POST(req: NextRequest) {
  // In production we would verify the signature
  // For now, we'll call handler directly 
  return handler(req);
}

export const runtime = "edge";
export const preferredRegion = "auto";
