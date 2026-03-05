import Link from "next/link";

import { Button } from "../button/button";

export type PaginationProps = {
  baseUrl: string;
  className?: string;
  currentPage: number;
  totalPages: number;
};

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

  // Previous button
  const previousButton =
    currentPage > 1 ? (
      <Link href={`${baseUrl}?page=${currentPage - 1}`} key="prev">
        <Button size="sm" variant="outline">
          <span className="text-sm">‹</span>
          <span className="sr-only">Previous</span>
        </Button>
      </Link>
    ) : null;

  // Page numbers
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => {
      const pageNumber = startPage + index;
      return (
        <Link href={`${baseUrl}?page=${pageNumber}`} key={pageNumber}>
          <Button
            size="sm"
            variant={pageNumber === currentPage ? "default" : "outline"}
          >
            {pageNumber}
          </Button>
        </Link>
      );
    },
  );

  // Next button
  const nextButton =
    currentPage < totalPages ? (
      <Link href={`${baseUrl}?page=${currentPage + 1}`} key="next">
        <Button size="sm" variant="outline">
          <span className="sr-only">Next</span>
          <span className="text-sm">›</span>
        </Button>
      </Link>
    ) : null;

  const pages = [previousButton, ...pageNumbers, nextButton].filter(Boolean);

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {pages}
    </div>
  );
}
