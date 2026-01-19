"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface SidebarProps {
  categories: string[];
}

export default function Sidebar({ categories }: SidebarProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "All";

  return (
    <aside className="w-full md:w-48 shrink-0">
      <div className="sticky top-12">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 px-2">
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
                      ? "bg-white text-background font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }
                  relative group
                `}
              >
                {cat}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
