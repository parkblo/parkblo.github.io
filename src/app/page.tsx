import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";
import { getAllPosts, getAllCategories } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "홈",
  description:
    "프론트엔드 개발, 웹 기술, 그리고 개발자의 생각을 기록하는 블로그입니다.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category = "All", page = "1" } = await searchParams;
  /* 
     Ensure currentPage is at least 1. 
     parseInt might return NaN, so we default to 1.
  */
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const POSTS_PER_PAGE = 5;

  const allPosts = getAllPosts();
  const filteredPosts =
    category === "All"
      ? allPosts
      : allPosts.filter((p) => p.category === category);

  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex-1">
          <div className="flex flex-col gap-10">
            {paginatedPosts.map((post) => (
              <Link
                href={`/posts/${post.slug}`}
                key={post.slug}
                className="group cursor-pointer flex gap-5 items-start"
              >
                <div className="w-10 h-10 shrink-0 bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:bg-accent group-hover:text-background transition-colors">
                  <i className={post.icon + " text-xl"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-base font-bold group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <time className="text-[10px] text-gray-600 font-mono">
                      {post.date}
                    </time>
                  </div>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-700 block" />{" "}
                    {post.category}
                  </div>
                </div>
              </Link>
            ))}

            {paginatedPosts.length === 0 && (
              <p className="text-gray-500 italic">
                No posts found in this category.
              </p>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              category={category}
            />
          </div>
        </div>

        <Suspense fallback={<div className="w-48" />}>
          <Sidebar categories={getAllCategories()} />
        </Suspense>
      </div>
    </>
  );
}
