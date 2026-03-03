"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TOC({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [typedHeadings, setTypedHeadings] = useState<number>(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let observer: IntersectionObserver | null = null;

    const frame = requestAnimationFrame(() => {
      const articleContent = document.querySelector("article .prose");
      if (!articleContent) {
        setHeadings([]);
        setTypedHeadings(0);
        return;
      }

      const headingElements = Array.from(
        articleContent.querySelectorAll<HTMLHeadingElement>(
          "h1, h2, h3, h4, h5, h6",
        ),
      ).filter((el) => el.id && el.textContent?.trim());

      const extracted: Heading[] = headingElements.map((el) => ({
        id: el.id,
        text: el.textContent?.trim() ?? "",
        level: Number(el.tagName.slice(1)),
      }));

      setHeadings(extracted);
      setTypedHeadings(0);

      // Typing animation for TOC items
      let i = 0;
      interval = setInterval(() => {
        setTypedHeadings((prev) => prev + 1);
        i++;
        if (i >= extracted.length && interval) {
          clearInterval(interval);
        }
      }, 100);

      // Intersection Observer for scroll sync
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: "-20% 0px -70% 0px" },
      );

      headingElements.forEach((el) => observer?.observe(el));
    });

    return () => {
      cancelAnimationFrame(frame);
      if (interval) clearInterval(interval);
      observer?.disconnect();
    };
  }, [content]);

  if (headings.length === 0) return null;
  const baseLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav className="hidden xl:block fixed left-10 top-20 w-48 font-galmuri">
      <div className="mb-6">
        <ThemeToggle />
      </div>
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">
        On This Page
      </h2>
      <ul className="flex flex-col gap-3 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2">
        {headings.slice(0, typedHeadings).map((h) => (
          <li
            key={h.id}
            style={{ paddingLeft: `${(h.level - baseLevel) * 12}px` }}
            className="transition-all duration-300"
          >
            <a
              href={`#${h.id}`}
              className={`
                text-[11px] block transition-colors duration-300
                ${activeId === h.id ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"}
              `}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(h.id)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {"> "} {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
