import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chicken Art Gallery - FlockNerd",
  description:
    "A collection of AI-generated chicken artwork — phone backgrounds featuring chickens, roosters, and farm scenes.",
  openGraph: {
    title: "AI Chicken Art Gallery - FlockNerd",
    description:
      "A collection of AI-generated chicken artwork — phone backgrounds featuring chickens, roosters, and farm scenes.",
    url: "https://flocknerd.com/ai-images",
    siteName: "FlockNerd",
    type: "website",
    images: [
      {
        url: "https://flocknerd.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "FlockNerd — Egg-ceptional Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Chicken Art Gallery - FlockNerd",
    description:
      "A collection of AI-generated chicken artwork — phone backgrounds featuring chickens, roosters, and farm scenes.",
    images: ["https://flocknerd.com/og-image.png"],
    site: "@imjoshnewton",
  },
};

function getAiImages() {
  const dir = path.join(process.cwd(), "public/static/images/ai-chicken-art");
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort();
  return files;
}

export default function AiImagesGallery() {
  const images = getAiImages();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold text-primary sm:text-4xl">
        AI Chicken Art Gallery
      </h1>
      <p className="mb-8 text-gray-600">
        A collection of AI-generated chicken artwork. Click any image to view it
        full size.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((filename) => {
          const slug = encodeURIComponent(filename);
          return (
            <Link
              key={filename}
              href={`/ai-images/${slug}`}
              className="group overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md"
            >
              <Image
                src={`/static/images/ai-chicken-art/${filename}`}
                alt="AI-generated chicken artwork"
                width={400}
                height={600}
                className="h-auto w-full object-cover transition-transform group-hover:scale-105"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
