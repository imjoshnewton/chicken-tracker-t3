import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  draft: boolean;
  summary: string;
  images?: string[];
  readingTime: string;
  content: string;
}

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const filePath = path.join(BLOG_DIR, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      if (data.draft) return null;

      return {
        slug,
        title: data.title as string,
        date: data.date as string,
        tags: (data.tags as string[]) || [],
        draft: (data.draft as boolean) || false,
        summary: data.summary as string,
        images: data.images as string[] | undefined,
        readingTime: readingTime(content).text,
        content,
      };
    })
    .filter(Boolean) as BlogPost[];

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    tags: (data.tags as string[]) || [],
    draft: (data.draft as boolean) || false,
    summary: data.summary as string,
    images: data.images as string[] | undefined,
    readingTime: readingTime(content).text,
    content,
  };
}
