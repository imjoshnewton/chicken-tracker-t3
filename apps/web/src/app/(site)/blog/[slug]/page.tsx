import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@lib/blog";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const ogImage =
    post.images && post.images.length > 0
      ? `https://flocknerd.com${post.images[0]}`
      : "https://flocknerd.com/og-image.png";

  return {
    title: `${post.title} - FlockNerd`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `https://flocknerd.com/blog/${slug}`,
      siteName: "FlockNerd",
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [ogImage],
      site: "@imjoshnewton",
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mdxComponents: Record<string, React.ComponentType<any>> = {
  img: (props: { src?: string; alt?: string; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} className="rounded-lg" alt={props.alt || ""} />
  ),
  a: (props: {
    href?: string;
    children?: React.ReactNode;
    className?: string;
  }) => (
    <a href={props.href} className="text-primary hover:underline">
      {props.children}
    </a>
  ),
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/blog"
        className="mb-6 inline-block text-sm text-primary hover:underline"
      >
        &larr; Back to Blog
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-primary sm:text-4xl">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>&middot;</span>
            <span>{post.readingTime}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {post.images && post.images.length > 0 && (
          <div className="mb-8 overflow-hidden rounded-lg">
            <Image
              src={post.images[0]!}
              alt={post.title}
              width={800}
              height={450}
              className="w-full object-cover"
              priority
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none prose-headings:text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>
      </article>
    </div>
  );
}
