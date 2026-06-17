"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

/** Single expandable card entry. */
export type ExpandableCardItem = {
  /** Revealed content shown while expanded. */
  content: React.ReactNode;
  /** Supporting text shown under the title. */
  description?: string;
  /** Stable identifier used to track the open card. */
  id: string;
  /** Header label and toggle. */
  title: string;
};

/** Props for {@link ExpandableCards}. */
export type ExpandableCardsProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Cards rendered as an accordion-like stack. */
  cards: ExpandableCardItem[];
};

/**
 * Stack of cards that expand to reveal content with a height transition.
 *
 * Respects `prefers-reduced-motion`: panels open without animating.
 *
 * @example
 * ```tsx
 * <ExpandableCards cards={items} />
 * ```
 */
export const ExpandableCards = React.forwardRef<
  HTMLDivElement,
  ExpandableCardsProps
>(({ cards, className, ...props }, ref) => {
  const [expandedId, setExpandedId] = React.useState<null | string>(null);

  const toggle = (id: string): void => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className={cn("flex flex-col gap-3", className)} ref={ref} {...props}>
      {cards.map((card) => (
        <ExpandableCard
          card={card}
          expanded={expandedId === card.id}
          key={card.id}
          onToggle={toggle}
        />
      ))}
    </div>
  );
});
ExpandableCards.displayName = "ExpandableCards";

function ExpandableCard({
  card,
  expanded,
  onToggle,
}: {
  card: ExpandableCardItem;
  expanded: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <button
        aria-expanded={expanded}
        className="flex w-full flex-col items-start gap-1 p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={() => {
          onToggle(card.id);
        }}
        type="button"
      >
        <span className="font-medium">{card.title}</span>
        {card.description === undefined ? null : (
          <span className="text-sm text-muted-foreground">
            {card.description}
          </span>
        )}
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 motion-reduce:transition-none",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 text-sm text-muted-foreground">
            {card.content}
          </div>
        </div>
      </div>
    </div>
  );
}
