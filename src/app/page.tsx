import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PostList from "@/components/PostList";
import { getAllPosts, getAllCategories } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "parkblo",
  description: "웹 위주의 개발 기록과 회고를 남기는 블로그입니다.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const allPosts = getAllPosts();

  return (
    <>
      <Header />
      <h1 className="sr-only">parkblo 개발 블로그</h1>
      <div className="flex flex-col md:flex-row gap-3 md:gap-12">
        <div className="order-2 md:order-1 flex-1">
          <Suspense fallback={<div>Loading...</div>}>
            <PostList allPosts={allPosts} />
          </Suspense>
        </div>

        <div className="order-1 md:order-2">
          <Suspense fallback={<div className="w-48" />}>
            <Sidebar categories={getAllCategories()} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
