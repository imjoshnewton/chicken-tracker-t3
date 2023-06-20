import * as admin from "firebase-admin";
import { verifySignature } from "@upstash/qstash/nextjs";
import { type NextApiRequest, type NextApiResponse } from "next";

const firebaseConfig = {
  projectId: "chicken-tracker-83ef8",
  clientEmail: process.env.GCP_CLIENT_EMAIL,
  privateKey: JSON.parse(process.env.GCP_PRIVATE_KEY!),
};

// Firebase initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    storageBucket: "chicken-tracker-83ef8.appspot.com",
  });
}

const bucket = admin.storage().bucket();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  //   if (req.method !== "POST") {
  //     return res.status(400).json({ error: "Only POST requests are allowed" });
  //   }

  const folderName = "summary-image";

  try {
    const [files] = await bucket.getFiles({ prefix: folderName });
    files.forEach(async (file) => {
      if (file.name.startsWith(folderName)) {
        await file.delete();
      }
    });

    return res.status(200).json({ message: "Files deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to delete files", details: error });
  }
};

export default handler; //verifySignature(handler);
