"use client";

import * as React from "react";

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible";

import { named } from "../../../lib/named";
import { useControllableState } from "../../../lib/use-controllable-state";
import { cn } from "../../../lib/utils";

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
  /** Id of the card that starts open. Ignored once `expandedId` has a value. */
  defaultExpandedId?: null | string;
  /** Id of the open card, or `null` for none. Pair it with `onExpandedIdChange`. */
  expandedId?: null | string;
  /** Called with the id of the card that opened, or `null` when it closed. */
  onExpandedIdChange?: (id: null | string) => void;
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
export const ExpandableCards = /* @__PURE__ */ named(
  "ExpandableCards",
  ({
    cards,
    className,
    defaultExpandedId = null,
    expandedId: expandedIdProperty,
    onExpandedIdChange,
    ref,
    ...props
  }: ExpandableCardsProps & { ref?: React.Ref<HTMLDivElement> }) => {
    const [expandedId, setExpandedId] = useControllableState<null | string>({
      defaultValue: defaultExpandedId,
      onChange: onExpandedIdChange,
      value: expandedIdProperty,
    });

    const toggle = (id: string): void => {
      setExpandedId(expandedId === id ? null : id);
    };

    return (
      <div
        className={cn("flex flex-col gap-3", className)}
        ref={ref}
        {...props}
      >
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
  },
);

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
    <Collapsible
      className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
      onOpenChange={() => {
        onToggle(card.id);
      }}
      open={expanded}
    >
      <CollapsibleTrigger className="flex w-full flex-col items-start gap-1 p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground">
        <span className="font-medium">{card.title}</span>
        {card.description === undefined ? null : (
          <span className="text-sm text-muted-foreground">
            {card.description}
          </span>
        )}
      </CollapsibleTrigger>
      {/* Kept in the page while closed, so the content stays in the HTML. */}
      <CollapsiblePanel
        className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-300 motion-reduce:transition-none data-[ending-style]:h-0 data-[starting-style]:h-0"
        keepMounted
      >
        <div className="px-4 pb-4 text-sm text-muted-foreground">
          {card.content}
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}
