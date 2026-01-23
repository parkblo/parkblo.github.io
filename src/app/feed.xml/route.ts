import { getAllPosts } from "@/lib/mdx";

const BLOG_URL = "https://parkblo.github.io";
const BLOG_TITLE = "parkblo";
const BLOG_SUBTITLE = "웹 위주의 개발 기록과 회고를 남기는 블로그입니다.";

export async function GET() {
  const posts = getAllPosts();

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${BLOG_TITLE}</title>
    <link>${BLOG_URL}</link>
    <description>${BLOG_SUBTITLE}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts
      .map((post) => {
        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${BLOG_URL}/posts/${post.slug}</link>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>${BLOG_URL}/posts/${post.slug}</guid>
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
