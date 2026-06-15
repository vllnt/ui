"use client";

import { Pagination } from "@vllnt/ui";

export default function PaginationPreview() {
  return <Pagination baseUrl="/blog" currentPage={3} totalPages={10} />;
}
