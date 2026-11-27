"use client";

import { type FocusEvent, useCallback, useEffect, useRef } from "react";

import { named } from "../../../lib/named";
import { moveRovingFocus } from "../../../lib/roving-focus";
import { cn } from "../../../lib/utils";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

// The toolbar marks each control it manages. A custom control that the toolbar
// moved out of the tab order (`tabindex="-1"`) no longer matches
// `FOCUSABLE_SELECTOR`, so the mark keeps it reachable by the arrow keys.
const ITEM_SELECTOR = `${FOCUSABLE_SELECTOR},[data-toolbar-item]`;

/**
 * Leaves `current` as the single control of the toolbar in the tab order, or
 * the first enabled control when `current` left the toolbar or got disabled.
 */
function syncTabStops(toolbar: HTMLElement, current: Element | null): void {
  const items = [...toolbar.querySelectorAll<HTMLElement>(ITEM_SELECTOR)];
  const enabled = items.filter(
    (item) => !item.matches(':disabled, [aria-disabled="true"]'),
  );
  const stop = enabled.find((item) => item === current) ?? enabled[0];
  items.forEach((item) => {
    item.dataset.toolbarItem = "";
    item.tabIndex = item === stop ? 0 : -1;
  });
}

/** Orientation shared by the toolbar and its separators. */
export type ToolbarOrientation = "horizontal" | "vertical";

/** Props for the {@link Toolbar} container. */
export type ToolbarProps = {
  /** Layout and arrow-key navigation axis. Defaults to `horizontal`. */
  orientation?: ToolbarOrientation;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Horizontal (or vertical) container that groups related controls with
 * `role="toolbar"`. The toolbar is one tab stop: Tab enters on the control
 * that had focus last, and the arrow keys along `orientation`, Home and End
 * move between controls.
 * @example
 * <Toolbar aria-label="Formatting">
 *   <Button>Bold</Button>
 *   <ToolbarSeparator />
 *   <Button>Italic</Button>
 * </Toolbar>
 */
const Toolbar = /* @__PURE__ */ named(
  "Toolbar",
  ({
    className,
    onFocus,
    onKeyDown,
    orientation = "horizontal",
    ref,
    ...props
  }: ToolbarProps & { ref?: React.Ref<HTMLDivElement> }) => {
    const toolbarRef = useRef<HTMLDivElement | null>(null);
    const lastFocusedRef = useRef<Element | null>(null);

    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        toolbarRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    // Controls come and go, and get disabled, without the toolbar rendering.
    useEffect(() => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;
      const sync = (): void => {
        syncTabStops(toolbar, lastFocusedRef.current);
      };
      sync();
      const observer = new MutationObserver(sync);
      observer.observe(toolbar, {
        attributeFilter: ["aria-disabled", "disabled"],
        attributes: true,
        childList: true,
        subtree: true,
      });
      return () => {
        observer.disconnect();
      };
    }, []);

    function handleFocus(event: FocusEvent<HTMLDivElement>): void {
      onFocus?.(event);
      if (
        event.target instanceof HTMLElement &&
        event.target.matches("[data-toolbar-item]")
      ) {
        lastFocusedRef.current = event.target;
        syncTabStops(event.currentTarget, event.target);
      }
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
      onKeyDown?.(event);
      moveRovingFocus(event, ITEM_SELECTOR, { orientation });
    }

    return (
      <div
        aria-orientation={orientation}
        className={cn(
          "flex items-center gap-1 rounded-md border border-border bg-background p-1",
          orientation === "vertical" ? "flex-col" : "flex-row",
          className,
        )}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        ref={setRef}
        role="toolbar"
        {...props}
      />
    );
  },
);

/** Props for the {@link ToolbarSeparator}. */
export type ToolbarSeparatorProps = {
  /** Separator axis. Defaults to `vertical` (for a horizontal toolbar). */
  orientation?: ToolbarOrientation;
} & React.HTMLAttributes<HTMLDivElement>;

/** Visual and semantic divider between groups of toolbar controls. */
const ToolbarSeparator = /* @__PURE__ */ named(
  "ToolbarSeparator",
  ({
    className,
    orientation = "vertical",
    ref,
    ...props
  }: ToolbarSeparatorProps & { ref?: React.Ref<HTMLDivElement> }) => (
    <div
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "vertical" ? "mx-1 h-6 w-px" : "my-1 h-px w-full",
        className,
      )}
      ref={ref}
      role="separator"
      {...props}
    />
  ),
);

export { Toolbar, ToolbarSeparator };
