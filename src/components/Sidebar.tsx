"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Github } from "lucide-react";

interface SidebarProps {
  categories: string[];
}

export default function Sidebar({ categories }: SidebarProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "All";

  return (
    <aside className="w-full md:w-48 shrink-0">
      <div className="sticky top-12">
        <div className="mb-10 flex items-center gap-3 px-2">
          {/* GitHub Icon */}
          <a
            href="https://github.com/parkblo"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-accent hover:opacity-70 transition-opacity"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6 px-2">
          Categories
        </h2>
        <nav className="flex flex-col gap-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const href = cat === "All" ? "/" : `/?category=${cat}`;

            return (
              <Link
                key={cat}
                href={href}
                className={`
                  text-left px-3 py-2 text-sm transition-all duration-200 rounded-sm
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                  relative group
                `}
              >
                {cat}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
