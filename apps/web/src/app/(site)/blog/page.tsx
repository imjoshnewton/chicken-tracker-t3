import Link from "next/link";
import { getAllPosts } from "@lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - FlockNerd",
  description:
    "Tips, guides, and stories about backyard chicken keeping and egg production.",
  openGraph: {
    title: "Blog - FlockNerd",
    description:
      "Tips, guides, and stories about backyard chicken keeping and egg production.",
    url: "https://flocknerd.com/blog",
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
    title: "Blog - FlockNerd",
    description:
      "Tips, guides, and stories about backyard chicken keeping and egg production.",
    images: ["https://flocknerd.com/og-image.png"],
    site: "@imjoshnewton",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold text-primary sm:text-4xl">
        Blog
      </h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <Link href={`/blog/${post.slug}`}>
              <h2 className="mb-2 text-xl font-semibold text-primary hover:underline sm:text-2xl">
                {post.title}
              </h2>
            </Link>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>&middot;</span>
              <span>{post.readingTime}</span>
            </div>
            <p className="mb-4 text-gray-600">{post.summary}</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
