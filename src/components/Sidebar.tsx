"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Github, Menu, X } from "lucide-react";

interface SidebarProps {
  categories: string[];
}

export default function Sidebar({ categories }: SidebarProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "All";
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  return (
    <aside className="w-full md:w-48 shrink-0">
      <div className="sticky top-12">
        <div className="mb-4 flex items-center gap-3 px-2">
          {/* GitHub Icon */}
          <a
            href="https://github.com/parkblo"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        <div className="mb-6 flex items-center justify-between px-2">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Categories
          </h2>
          <button
            type="button"
            onClick={() => setIsCategoryOpen((prev) => !prev)}
            className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isCategoryOpen ? "Close categories" : "Open categories"}
            aria-expanded={isCategoryOpen}
            aria-controls="category-menu"
          >
            {isCategoryOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
        <nav
          id="category-menu"
          className={`${isCategoryOpen ? "flex" : "hidden"} md:flex flex-col gap-1`}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const href = cat === "All" ? "/" : `/?category=${cat}`;

            return (
              <Link
                key={cat}
                href={href}
                onClick={() => setIsCategoryOpen(false)}
                className={`
                  text-left px-3 py-2 text-sm font-normal rounded-sm
                  ${
                    isActive
                      ? "bg-accent text-accent-foreground font-bold"
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
