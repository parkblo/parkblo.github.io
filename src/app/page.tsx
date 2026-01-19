import Link from "next/link";
import { Suspense } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { getAllPosts } from "@/lib/mdx";

const CATEGORIES = ["All", "Development", "Design", "Thoughts"];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category = "All" } = await searchParams;
  const posts = getAllPosts();

  const filteredPosts =
    category === "All" ? posts : posts.filter((p) => p.category === category);

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex-1">
          <div className="flex flex-col gap-10">
            {filteredPosts.map((post) => (
              <Link
                href={`/posts/${post.slug}`}
                key={post.slug}
                className="group cursor-pointer flex gap-5 items-start"
              >
                <div className="w-10 h-10 shrink-0 bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-accent group-hover:text-background transition-colors">
                  <i className={post.icon + " text-xl"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-base font-bold group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <time className="text-[10px] text-zinc-600 font-mono">
                      {post.date}
                    </time>
                  </div>
                  <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-zinc-700 block" />{" "}
                    {post.category}
                  </div>
                </div>
              </Link>
            ))}

            {filteredPosts.length === 0 && (
              <p className="text-zinc-500 italic">
                No posts found in this category.
              </p>
            )}

            {/* Pagination */}
            <nav className="pt-12 flex gap-4 border-t border-zinc-900">
              <button
                disabled
                className="text-xs font-bold text-zinc-700 cursor-not-allowed"
              >
                &lt; PREVIOUS
              </button>
              <button className="text-xs font-bold text-white hover:text-accent">
                NEXT &gt;
              </button>
            </nav>
          </div>
        </div>

        <Suspense fallback={<div className="w-48" />}>
          <Sidebar categories={CATEGORIES} />
        </Suspense>
      </div>
    </>
  );
}
