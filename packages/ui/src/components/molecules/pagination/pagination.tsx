import Link from "next/link";

import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";

/** Localizable strings for {@link Pagination}. */
export type PaginationLabels = {
  /** Accessible name of the `nav` landmark. Defaults to `"Pagination"`. */
  navigation?: string;
  /** Name of the next-page link. Defaults to `"Next"`. */
  next?: string;
  /** Name of the previous-page link. Defaults to `"Previous"`. */
  previous?: string;
};

export type PaginationProps = {
  baseUrl: string;
  className?: string;
  currentPage: number;
  /** Localizable accessible names. */
  labels?: PaginationLabels;
  totalPages: number;
};

const DEFAULT_LABELS: Required<PaginationLabels> = {
  navigation: "Pagination",
  next: "Next",
  previous: "Previous",
};

function resolveLabels(
  labels: PaginationLabels | undefined,
): Required<PaginationLabels> {
  return {
    navigation: labels?.navigation ?? DEFAULT_LABELS.navigation,
    next: labels?.next ?? DEFAULT_LABELS.next,
    previous: labels?.previous ?? DEFAULT_LABELS.previous,
  };
}

/**
 * Page links wrapped in a `nav` landmark. Each page is a single link styled
 * as a button (no nested interactive elements) and the current page carries
 * `aria-current="page"`.
 */
export function Pagination({
  baseUrl,
  className,
  currentPage,
  labels,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const text = resolveLabels(labels);
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
          <span className="sr-only">{text.previous}</span>
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
          <span className="sr-only">{text.next}</span>
          <span aria-hidden="true" className="text-sm">
            ›
          </span>
        </Link>
      </Button>
    ) : null;

  const pages = [previousButton, ...pageNumbers, nextButton].filter(Boolean);

  return (
    <nav
      aria-label={text.navigation}
      className={cn("flex items-center justify-center gap-2", className)}
    >
      {pages}
    </nav>
  );
}
