import * as admin from "firebase-admin";
import { verifySignature } from "@upstash/qstash/nextjs";
import { type NextApiRequest, type NextApiResponse } from "next";

const serviceAccount = require("./chicken-tracker-83ef8-firebase-adminsdk-dwql3-a73864962e.json");

// const firebaseConfig = {
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   privateKey: process.env.FIREBASE_PRIVATE_KEY
//     ? JSON.parse(process.env.FIREBASE_PRIVATE_KEY)
//     : undefined,
//   clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
// };

// Firebase initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "chicken-tracker-83ef8.appspot.com",
  });
}

const bucket = admin.storage().bucket();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const folderName = "summary-images";

  try {
    const files = await bucket.getFiles({ prefix: folderName });
    console.log("files: ", files);

    files.forEach(async (file) => {
      console.log("file: ", file);

      if (file.name.startsWith(folderName)) {
        const result = await file.delete();

        console.log("result: ", result);
      }
    });

    return res.status(200).json({ message: "Files deleted successfully" });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ error: "Failed to delete files", details: error });
  }
};

export default verifySignature(handler);
