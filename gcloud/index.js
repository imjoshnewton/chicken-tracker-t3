const puppeteer = require("puppeteer");
const admin = require("firebase-admin");
const { z } = require("zod");
const cors = require("cors");

// Define your schema
const requestSchema = z.object({
  id: z.string(),
  month: z.string(),
  year: z.string(),
});

// Firebase initialization
if (!admin.apps.length) {
  admin.initializeApp();
}

const bucket = admin.storage().bucket("chicken-tracker-83ef8.appspot.com");

// exports.summary = async (req, res) => {
//   // log the request body
//   console.log("body: ", req.body);

//   let flockId, month, year;
//   try {
//     // Parsing and validation with Zod
//     ({ id: flockId, month, year } = requestSchema.parse(req.body));
//   } catch (error) {
//     // Respond with error message if validation fails
//     return res.status(400).json({ error: "Invalid request data." });
//   }

//   try {
//     const browser = await puppeteer.launch({
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });

//     const page = await browser.newPage();

//     // Set the viewport to your preferred dimensions
//     await page.setViewport({
//       width: 1080,
//       height: 1920,
//       deviceScaleFactor: 1.5,
//     });

//     const url = `https://summary.FlockNerd.com/${flockId}?month=${month}&year=${year}`;
//     await page.goto(url, { waitUntil: "networkidle2" });

//     const screenshotBuffer = await page.screenshot();

//     await browser.close();

//     // Generate a file path
//     const filePath = `summary-images/${flockId}${month}${year}.png`;

//     // Upload the image to Firebase storage
//     const file = bucket.file(filePath);
//     const writeStream = file.createWriteStream({
//       metadata: {
//         contentType: "image/png",
//       },
//     });

//     writeStream.end(screenshotBuffer);

//     writeStream.on("error", (err) => {
//       throw new Error(err);
//     });

//     writeStream.on("finish", async () => {
//       // Make the image public
//       //   await file.makePublic();

//       // get download url
//       const [url] = await file.getSignedUrl({
//         action: "read",
//         expires: "03-09-2491",
//       });

//       // Get the public URL for the image
//       //   const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

//       // Return the public URL to the client
//       res.status(200).json({ url });
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const puppeteer = require("puppeteer");
// const admin = require("firebase-admin");

// const serviceAccount = require("./path/to/your/serviceAccountKey.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "your-firebase-bucket-url",
// });

// const bucket = admin.storage().bucket();

const corsHandler = cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      origin.startsWith("http://localhost") ||
      origin.endsWith(".flocknerd.com")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
});

exports.summary = async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { id: flockId, month, year } = requestSchema.parse(req.body);

      const filename = `summary-images/${flockId}${month}${year}.png`;
      const file = bucket.file(filename);

      // Check if file already exists
      const [exists] = await file.exists();
      if (exists) {
        res.json({ ref: filename });
        return;
      }

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setViewport({
        width: 1080,
        height: 1920,
        deviceScaleFactor: 1.5,
      });
      await page.goto(
        `https://summary.FlockNerd.com/${flockId}?month=${month}&year=${year}`
      );
      const screenshot = await page.screenshot({ type: "png" });
      await browser.close();

      const blob = bucket.file(filename);
      const blobStream = blob.createWriteStream({ resumable: false });

      blobStream.on("error", (err) => {
        res.status(500).json({
          error: `Unable to upload image, something went wrong: ${err}`,
        });
      });

      blobStream.on("finish", () => {
        res.status(200).json({ ref: filename });
      });

      blobStream.end(screenshot);
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });
};
