import Link from "next/link";
import { Button } from "@components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - FlockNerd",
  description:
    "FlockNerd is built by a chicken keeper who writes code. Learn the story behind the app.",
  openGraph: {
    title: "About - FlockNerd",
    description:
      "FlockNerd is built by a chicken keeper who writes code. Learn the story behind the app.",
    url: "https://flocknerd.com/about",
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
    title: "About - FlockNerd",
    description:
      "FlockNerd is built by a chicken keeper who writes code. Learn the story behind the app.",
    images: ["https://flocknerd.com/og-image.png"],
    site: "@imjoshnewton",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold text-primary sm:text-4xl">
        About FlockNerd
      </h1>
      <p className="mb-10 text-lg text-tertiary font-medium">
        Built by a chicken keeper who writes code.
      </p>

      <div className="prose prose-lg max-w-none text-gray-700">
        <p>
          I&apos;m Josh. I live on 12 acres in rural Pennsylvania with my wife
          Apphia, our six kids (ages 3 to 16), a border collie named Teddy, and
          eleven chickens&nbsp;&mdash; a rooster of undetermined lineage, three
          Black Australorps, three Barred Rocks, two Bantams, and two that
          refuse to be categorized.
        </p>

        <p>
          I built FlockNerd because I wanted to track my flock&apos;s egg
          production and I was tired of doing it in spreadsheets. Turns out,
          daily egg counts are one of the first warning signs that something is
          wrong&nbsp;&mdash; a sudden drop can mean a health issue, stress, or
          predators in the area. I wanted something that made that data easy to
          log and easy to read.
        </p>

        <p>
          I originally built the app to teach myself a new web framework. Then I
          kept using it. Then I kept improving it. That was a few years ago, and
          I&apos;m still logging eggs every morning.
        </p>

        <p>
          FlockNerd is a one-person project. There&apos;s no company behind it,
          no investors, no marketing department. Just me, my chickens, and a
          belief that backyard flock keepers deserve a real tool&nbsp;&mdash; not
          another spreadsheet.
        </p>

        <p>
          If you keep chickens, ducks, or quail, I built this for people like
          us.
        </p>
      </div>

      <p className="mt-8 text-lg font-medium text-primary">
        &mdash; Josh
      </p>

      {/* Photo placeholder: Josh with chickens, or the flock on the property */}
      <div className="mt-10 flex h-64 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
        Photo coming soon
      </div>

      <div className="mt-10 text-center">
        <Button variant="secondary" asChild>
          <Link href="/auth/sign-up">
            Try FlockNerd &mdash; it&apos;s free
          </Link>
        </Button>
      </div>
    </div>
  );
}
