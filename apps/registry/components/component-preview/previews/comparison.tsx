"use client";

import { Comparison } from "@vllnt/ui";

export default function ComparisonPreview() {
  return (
    <Comparison
      after={{
        items: ["Full TypeScript", "Easy to refactor"],
        title: "After",
        variant: "good",
      }}
      before={{
        items: ["No type safety", "Hard to maintain"],
        title: "Before",
        variant: "bad",
      }}
      title="Code Quality"
    />
  );
}
