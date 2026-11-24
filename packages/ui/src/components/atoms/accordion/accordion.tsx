"use client";

import { createContext, use, useId } from "react";

import {
  Accordion as AccordionPrimitive,
  AccordionItem as AccordionItemPrimitive,
  AccordionPanel,
  AccordionTrigger as AccordionTriggerPrimitive,
} from "@ui-sdk/react/accordion";
import { renderElement } from "@ui-sdk/react/primitive";
import type { ReactNode } from "react";

import { withDataAttributes } from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";

// Holds the id prefix that ties each trigger to its panel.
const AccordionIdContext = createContext<null | string>(null);

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

/** Classes of a trigger, which change with the open state. */
function getTriggerClassName(className: string | undefined) {
  return ({ open }: { open: boolean }) =>
    cn(
      "w-full flex items-center justify-between p-4 text-left font-medium transition-colors",
      "hover:bg-secondary/50",
      open && "bg-secondary/30",
      className,
    );
}

/**
 * Renders the panel as the old markup did: a closed panel stays laid out at
 * zero height and is `inert`, which takes it out of the tab order and the
 * accessibility tree while keeping its name and role.
 */
function renderPanel(props: Record<string, unknown>, state: { open: boolean }) {
  return renderElement(
    "div",
    { ...props, hidden: undefined, inert: !state.open },
    undefined,
    state,
  );
}

function useAccordionId(): string {
  const baseId = use(AccordionIdContext);
  if (!baseId) {
    throw new Error("AccordionItem must be used within an Accordion");
  }
  return baseId;
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

  return (
    <AccordionIdContext.Provider value={baseId}>
      <AccordionPrimitive
        className={cn(
          "my-6 divide-y divide-border rounded-lg border",
          className,
        )}
        defaultValue={
          typeof defaultValue === "string" ? [defaultValue] : defaultValue
        }
        multiple={type === "multiple"}
      >
        {children}
      </AccordionPrimitive>
    </AccordionIdContext.Provider>
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
    <AccordionItemPrimitive
      className={cn(
        "first:rounded-t-lg last:rounded-b-lg overflow-hidden",
        className,
      )}
      data-value={value}
      value={value}
    >
      {children}
    </AccordionItemPrimitive>
  );
}

export type AccordionTriggerProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  /** The enclosing `AccordionItem` sets which panel the trigger opens. */
  value: string;
};

function AccordionTrigger({
  children,
  className,
  icon,
  value,
}: AccordionTriggerProps): React.ReactNode {
  const baseId = useAccordionId();

  return (
    <AccordionTriggerPrimitive
      className={getTriggerClassName(className)}
      id={getPartId(baseId, "trigger", value)}
      // ui-sdk leaves out `aria-controls`; the panel id comes from the value.
      render={withDataAttributes("button", () => ({
        "aria-controls": getPartId(baseId, "content", value),
      }))}
    >
      {({ open }) => (
        <>
          <span className="text-sm">{children}</span>
          {icon ? (
            <span
              className={cn(
                "size-4 flex-shrink-0 transition-transform duration-200",
                open && "rotate-180",
              )}
            >
              {icon}
            </span>
          ) : (
            <svg
              aria-hidden="true"
              className={cn(
                "size-4 flex-shrink-0 transition-transform duration-200",
                open && "rotate-180",
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
        </>
      )}
    </AccordionTriggerPrimitive>
  );
}

export type AccordionContentProps = {
  children: ReactNode;
  className?: string;
  /** The enclosing `AccordionItem` sets which trigger opens the panel. */
  value: string;
};

function AccordionContent({
  children,
  className,
  value,
}: AccordionContentProps): React.ReactNode {
  const baseId = useAccordionId();

  return (
    <AccordionPanel
      className="h-[var(--accordion-panel-height)] overflow-hidden transition-[height,opacity] duration-200 [--radix-accordion-content-height:var(--accordion-panel-height)] [--radix-accordion-content-width:var(--accordion-panel-width)] data-[ending-style]:h-0 data-[starting-style]:h-0 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
      id={getPartId(baseId, "content", value)}
      keepMounted
      render={renderPanel}
    >
      <div
        className={cn(
          "p-4 pt-0 text-sm text-muted-foreground [&>p]:mb-2 [&>pre]:my-2",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPanel>
  );
}

// Attach sub-components
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
