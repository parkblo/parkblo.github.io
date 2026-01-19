import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_PATH = path.join(process.cwd(), "_posts");

export interface PostMetadata {
  title: string;
  description: string;
  category: string;
  date: string;
  icon: string;
  slug: string;
}

export function getPostSlugs() {
  return fs.readdirSync(POSTS_PATH).filter((path) => /\.mdx?$/.test(path));
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx?$/, "");
  const fullPath = path.join(POSTS_PATH, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    meta: { ...data, slug: realSlug } as PostMetadata,
    content,
  };
}

export function getAllPosts(): PostMetadata[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug).meta)
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
