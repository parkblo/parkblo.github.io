"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";
import { Post } from "@/lib/mdx";

interface PostListProps {
  allPosts: Post[];
}

export default function PostList({ allPosts }: PostListProps) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "All";
  const pageParam = searchParams.get("page") || "1";

  /* 
     Ensure currentPage is at least 1. 
     parseInt might return NaN, so we default to 1.
  */
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const POSTS_PER_PAGE = 5;

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
      <div className="flex flex-col gap-10">
        {paginatedPosts.map((post) => (
          <Link
            href={`/posts/${post.slug}`}
            key={post.slug}
            className="group cursor-pointer flex gap-5 items-start"
          >
            <i
              className={
                post.icon +
                " text-2xl text-muted-foreground group-hover:text-primary transition-colors duration-200"
              }
            />
            <div className="flex-1">
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-base font-bold group-hover:text-accent">
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
    </>
  );
}
