"use client";

import { CategoryFilter } from "@vllnt/ui";

export default function CategoryFilterPreview() {
  return (
    <CategoryFilter categories={["nextjs", "react", "typescript"]} lang="en" />
  );
}
