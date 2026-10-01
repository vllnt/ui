import Link from "next/link";

import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";

export type PaginationProps = {
  baseUrl: string;
  className?: string;
  currentPage: number;
  totalPages: number;
};

/**
 * Page links wrapped in a `nav` landmark. Each page is a single link styled
 * as a button (no nested interactive elements) and the current page carries
 * `aria-current="page"`.
 */
export function Pagination({
  baseUrl,
  className,
  currentPage,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const previousButton =
    currentPage > 1 ? (
      <Button asChild key="prev" size="sm" variant="outline">
        <Link href={`${baseUrl}?page=${currentPage - 1}`}>
          <span aria-hidden="true" className="text-sm">
            ‹
          </span>
          <span className="sr-only">Previous</span>
        </Link>
      </Button>
    ) : null;

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => {
      const pageNumber = startPage + index;
      const isCurrent = pageNumber === currentPage;
      return (
        <Button
          asChild
          key={pageNumber}
          size="sm"
          variant={isCurrent ? "default" : "outline"}
        >
          <Link
            aria-current={isCurrent ? "page" : undefined}
            href={`${baseUrl}?page=${pageNumber}`}
          >
            {pageNumber}
          </Link>
        </Button>
      );
    },
  );

  const nextButton =
    currentPage < totalPages ? (
      <Button asChild key="next" size="sm" variant="outline">
        <Link href={`${baseUrl}?page=${currentPage + 1}`}>
          <span className="sr-only">Next</span>
          <span aria-hidden="true" className="text-sm">
            ›
          </span>
        </Link>
      </Button>
    ) : null;

  const pages = [previousButton, ...pageNumbers, nextButton].filter(Boolean);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      {pages}
    </nav>
  );
}
