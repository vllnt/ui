"use client";

import { HorizontalScrollRow } from "@vllnt/ui";

const HORIZONTAL_SCROLL_ROW_CARDS = Array.from({ length: 6 }, (_, index) => ({
  id: `featured-card-${index + 1}`,
  label: `Card ${index + 1}`,
}));

export default function HorizontalScrollRowPreview() {
  return (
    <HorizontalScrollRow description="Browse our picks" title="Featured">
      {HORIZONTAL_SCROLL_ROW_CARDS.map((card) => (
        <div
          className="min-w-[180px] snap-start rounded-lg border bg-card p-4 text-sm"
          key={card.id}
        >
          {card.label}
        </div>
      ))}
    </HorizontalScrollRow>
  );
}
