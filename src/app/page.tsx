import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PostList from "@/components/PostList";
import { getAllPosts, getAllCategories } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "parkblo",
  description: "웹 위주의 개발 기록과 회고를 남기는 블로그입니다.",
};

export default function Home() {
  const allPosts = getAllPosts();

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex-1">
          <Suspense fallback={<div>Loading...</div>}>
            <PostList allPosts={allPosts} />
          </Suspense>
        </div>

        <Suspense fallback={<div className="w-48" />}>
          <Sidebar categories={getAllCategories()} />
        </Suspense>
      </div>
    </>
  );
}
