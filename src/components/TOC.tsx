"use client";

import { useEffect, useState } from "react";

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
    // Extract headings (H2, H3) from markdown content
    const headingRegex = /^##+\s+(.*)$/gm;
    const matches = Array.from(content.matchAll(headingRegex));
    const idCounts: { [key: string]: number } = {};

    const extracted = matches.map((match) => {
      const text = match[1];
      const level = match[0].split(" ")[0].length;

      // Support English, numbers, spaces, hyphens, and Korean characters
      let id = text
        .toLowerCase()
        .replace(/[^\w\s-\uAC00-\uD7A3]/g, "")
        .trim()
        .replace(/\s+/g, "-");

      // Fallback for empty IDs (e.g. special chars only)
      if (!id) id = "heading";

      // Handle duplicate IDs
      if (idCounts[id]) {
        idCounts[id]++;
        id = `${id}-${idCounts[id]}`;
      } else {
        idCounts[id] = 1;
      }

      return { id, text, level };
    });
    setHeadings(extracted);

    // Typing animation for TOC items
    let i = 0;
    const interval = setInterval(() => {
      setTypedHeadings((prev) => prev + 1);
      i++;
      if (i >= extracted.length) clearInterval(interval);
    }, 100);

    // Intersection Observer for scroll sync
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    extracted.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block fixed left-10 top-20 w-48 font-galmuri">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-6">
        On This Page
      </h2>
      <ul className="flex flex-col gap-3 font-mono">
        {headings.slice(0, typedHeadings).map((h) => (
          <li
            key={h.id}
            style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
            className="transition-all duration-300"
          >
            <a
              href={`#${h.id}`}
              className={`
                text-[11px] block transition-colors duration-300
                ${activeId === h.id ? "text-white" : "text-zinc-600 hover:text-zinc-400"}
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
