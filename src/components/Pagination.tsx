import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  category: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  category,
}: PaginationProps) {
  const categoryQuery = category !== "All" ? `&category=${category}` : "";
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <nav className="pt-12 flex gap-4 border-t border-gray-900 justify-between items-center">
      <Link
        href={`/?page=${currentPage - 1}${categoryQuery}`}
        aria-disabled={isFirstPage}
        tabIndex={isFirstPage ? -1 : undefined}
        className={`text-xs font-bold transition-all ${
          isFirstPage
            ? "text-gray-500 opacity-50 cursor-not-allowed pointer-events-none"
            : "text-gray-400 hover:text-white"
        }`}
      >
        &lt; PREVIOUS
      </Link>

      <span className="text-[10px] text-gray-600 font-mono">
        {totalPages > 0 ? `PAGE ${currentPage} OF ${totalPages}` : ""}
      </span>

      <Link
        href={`/?page=${currentPage + 1}${categoryQuery}`}
        aria-disabled={isLastPage}
        tabIndex={isLastPage ? -1 : undefined}
        className={`text-xs font-bold transition-all ${
          isLastPage
            ? "text-gray-500 opacity-50 cursor-not-allowed pointer-events-none"
            : "text-gray-400 hover:text-white"
        }`}
      >
        NEXT &gt;
      </Link>
    </nav>
  );
}
