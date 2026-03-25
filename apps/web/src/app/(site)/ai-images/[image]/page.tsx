import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ image: string }>;
}

function getAiImages() {
  const dir = path.join(process.cwd(), "public/static/images/ai-chicken-art");
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort();
}

export async function generateStaticParams() {
  const images = getAiImages();
  return images.map((filename) => ({ image: encodeURIComponent(filename) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { image } = await params;
  const filename = decodeURIComponent(image);

  return {
    title: `AI Chicken Art - FlockNerd`,
    description: "AI-generated chicken artwork from FlockNerd",
    openGraph: {
      title: "AI Chicken Art - FlockNerd",
      description: "AI-generated chicken artwork from FlockNerd",
      images: [
        {
          url: `https://flocknerd.com/static/images/ai-chicken-art/${filename}`,
          alt: "AI-generated chicken artwork",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [
        `https://flocknerd.com/static/images/ai-chicken-art/${filename}`,
      ],
      site: "@imjoshnewton",
    },
  };
}

export default async function AiImagePage({ params }: Props) {
  const { image } = await params;
  const filename = decodeURIComponent(image);
  const images = getAiImages();

  if (!images.includes(filename)) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href="/ai-images"
        className="mb-6 inline-block text-sm text-primary hover:underline"
      >
        &larr; Back to Gallery
      </Link>
      <div className="flex justify-center">
        <Image
          src={`/static/images/ai-chicken-art/${filename}`}
          alt="AI-generated chicken artwork"
          width={600}
          height={900}
          className="h-auto max-h-[80vh] w-auto rounded-lg shadow-lg"
          priority
        />
      </div>
    </div>
  );
}
