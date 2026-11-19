"use client";

import {
  createContext,
  use,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import { cn } from "../../../lib/utils";

// Context for accordion state
type AccordionContextValue = {
  baseId: string;
  openItems: Set<string>;
  toggleItem: (value: string) => void;
  type: "multiple" | "single";
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

/**
 * Builds the DOM id of an item's trigger or panel. The id replaces each
 * character of `value` outside `[A-Za-z0-9-]` with `_<hex code>_`, so it has
 * no whitespace and two different values never produce the same id.
 */
function getPartId(
  baseId: string,
  part: "content" | "trigger",
  value: string,
): string {
  const key = value.replaceAll(
    /[^\dA-Za-z-]/g,
    (character) => `_${(character.codePointAt(0) ?? 0).toString(16)}_`,
  );
  return `${baseId}-${part}-${key}`;
}

function useAccordionContext(): AccordionContextValue {
  const context = use(AccordionContext);
  if (!context) {
    throw new Error("AccordionItem must be used within an Accordion");
  }
  return context;
}

export type AccordionProps = {
  children: ReactNode;
  className?: string;
  defaultValue?: string | string[];
  type?: "multiple" | "single";
};

function Accordion({
  children,
  className,
  defaultValue,
  type = "single",
}: AccordionProps): React.ReactNode {
  const baseId = useId();
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    if (!defaultValue) return new Set();
    if (Array.isArray(defaultValue)) return new Set(defaultValue);
    return new Set([defaultValue]);
  });

  const toggleItem = useCallback(
    (value: string) => {
      setOpenItems((previous) => {
        const newSet = new Set(previous);
        if (newSet.has(value)) {
          newSet.delete(value);
        } else {
          if (type === "single") {
            newSet.clear();
          }
          newSet.add(value);
        }
        return newSet;
      });
    },
    [type],
  );

  const contextValue = useMemo(
    () => ({ baseId, openItems, toggleItem, type }),
    [baseId, openItems, toggleItem, type],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        className={cn(
          "my-6 divide-y divide-border rounded-lg border",
          className,
        )}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export type AccordionItemProps = {
  children: ReactNode;
  className?: string;
  value: string;
};

function AccordionItem({
  children,
  className,
  value,
}: AccordionItemProps): React.ReactNode {
  return (
    <div
      className={cn(
        "first:rounded-t-lg last:rounded-b-lg overflow-hidden",
        className,
      )}
      data-value={value}
    >
      {children}
    </div>
  );
}

export type AccordionTriggerProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  value: string;
};

function AccordionTrigger({
  children,
  className,
  icon,
  value,
}: AccordionTriggerProps): React.ReactNode {
  const { baseId, openItems, toggleItem } = useAccordionContext();
  const isOpen = openItems.has(value);

  return (
    <button
      aria-controls={getPartId(baseId, "content", value)}
      aria-expanded={isOpen}
      className={cn(
        "w-full flex items-center justify-between p-4 text-left font-medium transition-colors",
        "hover:bg-secondary/50",
        isOpen && "bg-secondary/30",
        className,
      )}
      id={getPartId(baseId, "trigger", value)}
      onClick={() => {
        toggleItem(value);
      }}
      type="button"
    >
      <span className="text-sm">{children}</span>
      {icon ? (
        <span
          className={cn(
            "size-4 flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        >
          {icon}
        </span>
      ) : (
        <svg
          aria-hidden="true"
          className={cn(
            "size-4 flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="m6 9 6 6 6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      )}
    </button>
  );
}

export type AccordionContentProps = {
  children: ReactNode;
  className?: string;
  value: string;
};

function AccordionContent({
  children,
  className,
  value,
}: AccordionContentProps): React.ReactNode {
  const { baseId, openItems } = useAccordionContext();
  const isOpen = openItems.has(value);

  return (
    <div
      aria-labelledby={getPartId(baseId, "trigger", value)}
      className={cn(
        "overflow-hidden transition-all duration-200",
        isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
      )}
      id={getPartId(baseId, "content", value)}
      inert={!isOpen}
      role="region"
    >
      <div
        className={cn(
          "p-4 pt-0 text-sm text-muted-foreground [&>p]:mb-2 [&>pre]:my-2",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Attach sub-components
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
