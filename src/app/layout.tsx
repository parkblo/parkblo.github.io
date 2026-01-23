import type { Metadata } from "next";
import ThemeProvider from "@/components/ThemeProvider";
import ServiceWorkerUnregister from "@/components/ServiceWorkerUnregister";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://parkblo.github.io"),
  title: {
    default: "parkblo - 개발 블로그",
    template: "%s | parkblo",
  },
  description: "웹 위주의 개발 기록과 회고를 남기는 블로그입니다.",
  keywords: ["개발", "프론트엔드", "웹개발", "블로그", "parkblo"],
  authors: [{ name: "Park Byeongju", url: "https://parkblo.github.io" }],
  creator: "Park Byeongju",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://parkblo.github.io",
    siteName: "parkblo",
    title: "parkblo - 개발 블로그",
    description: "웹 위주의 개발 기록과 회고를 남기는 블로그입니다.",
  },
  twitter: {
    card: "summary_large_image",
    title: "parkblo - 개발 블로그",
    description: "웹 위주의 개발 기록과 회고를 남기는 블로그입니다.",
    creator: "@parkblo",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground font-galmuri flex flex-col items-center">
        <ServiceWorkerUnregister />
        <ThemeProvider>
          <main className="w-full max-w-[840px] px-6 min-h-screen pt-2 md:pt-10">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
