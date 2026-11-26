"use client";

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible";
import { ChevronDown, HelpCircle } from "lucide-react";
import type { ReactNode, Ref } from "react";

import type { HeadingTag } from "../../../lib/types";
import { cn } from "../../../lib/utils";

export type FAQItemProps = {
  children: ReactNode;
  /** Whether the answer starts open. Ignored once `open` has a value. */
  defaultOpen?: boolean;
  /** Called with the next state when a press toggles the answer. */
  onOpenChange?: (open: boolean) => void;
  /** Controls whether the answer is open. Pair it with `onOpenChange`. */
  open?: boolean;
  question: string;
};

const FAQItem = ({
  children,
  defaultOpen = false,
  onOpenChange,
  open,
  question,
  ref,
}: FAQItemProps & { ref?: Ref<HTMLDivElement> }) => (
  <Collapsible
    className="border-b border-border last:border-b-0"
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    open={open}
    ref={ref}
  >
    <CollapsibleTrigger className="w-full flex items-center justify-between py-4 text-left hover:text-primary transition-colors">
      {({ open: isOpen }) => (
        <>
          <span className="font-medium text-sm pr-4">{question}</span>
          <ChevronDown
            className={cn(
              "size-4 flex-shrink-0 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </>
      )}
    </CollapsibleTrigger>
    {/* Kept in the page while closed, so the answers stay in the HTML. */}
    <CollapsiblePanel
      className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 data-[ending-style]:h-0 data-[starting-style]:h-0"
      keepMounted
    >
      <div className="pb-4 text-sm text-muted-foreground [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </CollapsiblePanel>
  </Collapsible>
);
FAQItem.displayName = "FAQItem";

export type FAQProps = {
  /** Heading tag for the FAQ title. Defaults to `h4`. */
  as?: HeadingTag;
  children: ReactNode;
  title?: string;
};

function FAQ({
  as: Heading = "h4",
  children,
  title = "Frequently Asked Questions",
}: FAQProps) {
  return (
    <div className="my-6 rounded-lg border bg-card">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <HelpCircle className="size-5 text-primary" />
        <Heading className="font-semibold">{title}</Heading>
      </div>
      <div className="px-4">{children}</div>
    </div>
  );
}

FAQ.displayName = "FAQ";
FAQ.Item = FAQItem;

export { FAQ, FAQItem };
