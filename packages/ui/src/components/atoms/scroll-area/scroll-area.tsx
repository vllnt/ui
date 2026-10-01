"use client";

import * as React from "react";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "../../../lib/utils";

/** Tracks whether the viewport's content overflows it, on resize too. */
function useOverflows(
  viewportRef: React.RefObject<HTMLDivElement | null>,
): boolean {
  const [overflows, setOverflows] = React.useState(false);
  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = (): void => {
      setOverflows(
        viewport.scrollHeight > viewport.clientHeight ||
          viewport.scrollWidth > viewport.clientWidth,
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    if (viewport.firstElementChild) {
      observer.observe(viewport.firstElementChild);
    }
    return () => {
      observer.disconnect();
    };
  }, [viewportRef]);
  return overflows;
}

/**
 * Scrollable area with custom scrollbars. The viewport becomes a keyboard tab
 * stop while its content overflows (axe scrollable-region-focusable), and
 * `aria-label` / `aria-labelledby` name it as a region.
 */
const ScrollArea = ({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
  ref?: React.Ref<React.ComponentRef<typeof ScrollAreaPrimitive.Root>>;
}) => {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const overflows = useOverflows(viewportRef);
  const named = Boolean(ariaLabel ?? ariaLabelledBy);
  return (
    <ScrollAreaPrimitive.Root
      className={cn("relative overflow-hidden", className)}
      ref={ref}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className="h-full w-full rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        ref={viewportRef}
        role={named ? "region" : undefined}
        tabIndex={overflows ? 0 : undefined}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
};
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = ({
  className,
  orientation = "vertical",
  ref,
  ...props
}: React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
> & {
  ref?: React.Ref<
    React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
  >;
}) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    orientation={orientation}
    ref={ref}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
