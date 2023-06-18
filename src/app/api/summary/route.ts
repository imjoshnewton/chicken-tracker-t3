// import chromium from "chrome-aws-lambda";
// import puppeteer from "puppeteer-core";
import puppeteer from "puppeteer";
import * as admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

// Define your schema
const requestSchema = z.object({
  id: z.string(),
  month: z.string(),
  year: z.string(),
});

// Replace with your own Firebase config
const firebaseConfig = {
  projectId: "chicken-tracker-83ef8",
  //   clientEmail: "CLIENT_EMAIL",
  clientEmail: process.env.GCP_CLIENT_EMAIL,
  privateKey: JSON.parse(process.env.GCP_PRIVATE_KEY!),
  //   privateKey: "PRIVATE_KEY",
};

// Firebase initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    storageBucket: "chicken-tracker-83ef8.appspot.com",
  });
}

const bucket = admin.storage().bucket();

export async function POST(req: NextRequest) {
  let flockId, month, year;
  try {
    // Parsing and validation with Zod
    ({ id: flockId, month, year } = requestSchema.parse(await req.json()));
  } catch (error) {
    // Respond with error message if validation fails
    return NextResponse.json(
      {},
      { status: 400, statusText: "Invalid request data." }
    );
    // return res.status(400).json({ error: "Invalid request data." });
  }

  const url = `https://summary.FlockNerd.com/${flockId}?month=${month}&year=${year}`;

  const browser = await puppeteer.launch();
  // {
  // args: chromium.args,
  // executablePath: await chromium.executablePath,
  // headless: chromium.headless,
  // });

  const page = await browser.newPage();

  // Set the viewport size to 1.5 times Instagram Story dimensions
  await page.setViewport({ width: 1620, height: 2880 });

  await page.goto(url, { waitUntil: "networkidle2" });
  const screenshot = await page.screenshot({ type: "png" });

  await browser.close();

  const filename = `summary-images/${flockId}${month}${year}.png`;
  const file = bucket.file(filename);
  const stream = file.createWriteStream({
    metadata: {
      contentType: "image/png",
    },
  });

  stream.write(screenshot);
  stream.end();

  stream.on("error", (err) => {
    return NextResponse.json({}, { status: 500, statusText: err.message });
  });

  stream.on("finish", async () => {
    // Make the image public
    await file.makePublic();

    // Respond with the download URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    return NextResponse.json({ imageUrl: publicUrl }, { status: 200 });
    //   res.status(200).json({ imageUrl: publicUrl });
  });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({}, { status: 200, statusText: "OK" });
}
