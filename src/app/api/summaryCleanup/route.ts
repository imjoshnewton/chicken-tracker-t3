import * as admin from "firebase-admin";
import { verifySignatureEdge } from "@upstash/qstash/nextjs";
import { NextRequest, NextResponse } from "next/server";

const serviceAccount = require("./chicken-tracker-83ef8-firebase-adminsdk-dwql3-a73864962e.json");

// Firebase initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "chicken-tracker-83ef8.appspot.com",
  });
}

const bucket = admin.storage().bucket();

async function handler(req: NextRequest) {
  const folderName = "summary-images";

  try {
    const [files] = await bucket.getFiles({ prefix: folderName });

    console.log("Number of files to delete: ", files.length);

    await Promise.all(
      files.map(async (file) => {
        if (file.name.startsWith(folderName)) {
          console.log("Deleting file: ", file.name);
          const result = await file.delete();

          return result;
        }
      }),
    );

    console.log("Files deleted successfully");

    return NextResponse.json(
      { message: "Files deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete files", details: error },
      { status: 500 },
    );
  }
}

export const POST = verifySignatureEdge(handler);
