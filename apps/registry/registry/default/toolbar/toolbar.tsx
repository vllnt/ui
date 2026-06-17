import { forwardRef } from "react";

import { cn } from "@vllnt/ui";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Orientation shared by the toolbar and its separators. */
export type ToolbarOrientation = "horizontal" | "vertical";

/** Props for the {@link Toolbar} container. */
export type ToolbarProps = {
  /** Layout and arrow-key navigation axis. Defaults to `horizontal`. */
  orientation?: ToolbarOrientation;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Horizontal (or vertical) container that groups related controls with
 * `role="toolbar"` and roving arrow-key navigation (Arrow keys, Home, End).
 * @example
 * <Toolbar aria-label="Formatting">
 *   <Button>Bold</Button>
 *   <ToolbarSeparator />
 *   <Button>Italic</Button>
 * </Toolbar>
 */
const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, onKeyDown, orientation = "horizontal", ...props }, ref) => {
    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
      const previousKey =
        orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
      const isNext = event.key === nextKey;
      const isPrevious = event.key === previousKey;
      const isHome = event.key === "Home";
      const isEnd = event.key === "End";

      if (!isNext && !isPrevious && !isHome && !isEnd) return;

      const items = [
        ...event.currentTarget.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR,
        ),
      ];
      if (items.length === 0) return;

      event.preventDefault();
      const active =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      const currentIndex = active ? items.indexOf(active) : -1;

      let nextIndex = 0;
      if (isHome) {
        nextIndex = 0;
      } else if (isEnd) {
        nextIndex = items.length - 1;
      } else if (isNext) {
        nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
      } else {
        nextIndex =
          currentIndex < 0
            ? items.length - 1
            : (currentIndex - 1 + items.length) % items.length;
      }

      items[nextIndex]?.focus();
    }

    return (
      <div
        aria-orientation={orientation}
        className={cn(
          "flex items-center gap-1 rounded-md border border-border bg-background p-1",
          orientation === "vertical" ? "flex-col" : "flex-row",
          className,
        )}
        onKeyDown={handleKeyDown}
        ref={ref}
        role="toolbar"
        {...props}
      />
    );
  },
);
Toolbar.displayName = "Toolbar";

/** Props for the {@link ToolbarSeparator}. */
export type ToolbarSeparatorProps = {
  /** Separator axis. Defaults to `vertical` (for a horizontal toolbar). */
  orientation?: ToolbarOrientation;
} & React.HTMLAttributes<HTMLDivElement>;

/** Visual and semantic divider between groups of toolbar controls. */
const ToolbarSeparator = forwardRef<HTMLDivElement, ToolbarSeparatorProps>(
  ({ className, orientation = "vertical", ...props }, ref) => (
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
ToolbarSeparator.displayName = "ToolbarSeparator";

export { Toolbar, ToolbarSeparator };
