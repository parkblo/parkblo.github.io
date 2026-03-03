import { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { getPostBySlug, getPostSlugs } from "@/lib/mdx";
import { MDXComponents } from "@/components/MDXComponents";
import TOC from "@/components/TOC";
import Link from "next/link";
import { notFound } from "next/navigation";

import Giscus from "@/components/Giscus";
import SequentialPostTitle from "@/components/SequentialPostTitle";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { meta } = getPostBySlug(slug);
    return {
      title: meta.title,
      description: meta.description,
      openGraph: {
        title: meta.title,
        description: meta.description,
        type: "article",
        publishedTime: meta.date,
      },
    };
  } catch {
    return { title: "Post Not Found" };
  }
}

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.mdx?$/, ""),
  }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const { meta, content } = post;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    author: {
      "@type": "Person",
      name: "Park Byeongju",
      url: "https://parkblo.dev",
    },
    publisher: {
      "@type": "Person",
      name: "Park Byeongju",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://parkblo.dev/posts/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative flex justify-center">
        <TOC content={content} />

        <article className="py-4 md:py-12 w-full max-w-[640px] mx-auto">
          <Link
            href="/"
            className="post-page-back-link text-[10px] font-normal text-muted-foreground mb-8 inline-block tracking-widest"
          >
            &lt; BACK TO HOME
          </Link>

          <header className="mb-6 md:mb-12 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-4">
              <i className={meta.icon} />
              <span>{meta.category}</span>
              <span className="w-1 h-1 bg-border rounded-full" />
              <time>{meta.date}</time>
            </div>
            <h1
              className="text-3xl font-bold text-foreground mb-4 leading-tight break-normal"
              aria-label={meta.title}
            >
              <SequentialPostTitle key={slug} title={meta.title} />
            </h1>
            <p className="text-muted-foreground text-lg italic break-normal">
              {meta.description}
            </p>
          </header>

          <div className="prose dark:prose-invert max-w-none">
            <MDXRemote
              source={content}
              components={MDXComponents}
              options={{
                mdxOptions: {
                  rehypePlugins: [
                    [
                      rehypePrettyCode,
                      {
                        theme: {
                          dark: "github-dark",
                          light: "github-light",
                        },
                      },
                    ],
                    rehypeKatex,
                    rehypeSlug,
                  ],
                  remarkPlugins: [remarkGfm, remarkMath],
                },
              }}
            />
          </div>

          <hr className="my-12 border-border" />
          <Giscus />
        </article>
      </div>
    </>
  );
}
