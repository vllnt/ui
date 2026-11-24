"use client";

import * as React from "react";

import {
  ScrollArea as ScrollAreaPrimitive,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area";

import { type DataAttributes, withDataAttributes } from "../../../lib/ui-sdk";
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

/** Lets a horizontal `ScrollBar` tell its `ScrollArea` the x axis scrolls. */
const HorizontalContext = React.createContext<
  ((present: boolean) => void) | null
>(null);

const visibleState = (state: { visible: boolean }): DataAttributes => ({
  "data-state": state.visible ? "visible" : "hidden",
});

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
}: React.ComponentProps<typeof ScrollAreaPrimitive> & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const overflows = useOverflows(viewportRef);
  // Like Radix, clip the x axis unless a horizontal scrollbar renders.
  const [horizontal, setHorizontal] = React.useState(false);
  const named = Boolean(ariaLabel ?? ariaLabelledBy);
  return (
    <ScrollAreaPrimitive
      className={cn("relative overflow-hidden", className)}
      ref={ref}
      {...props}
    >
      <HorizontalContext value={setHorizontal}>
        <ScrollAreaViewport
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={cn(
            "h-full w-full rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            // ui-sdk sets `overflow: auto` inline, so clipping x needs `!important`.
            !horizontal && "!overflow-x-hidden",
          )}
          data-radix-scroll-area-viewport=""
          ref={viewportRef}
          role={named ? "region" : undefined}
          tabIndex={overflows ? 0 : undefined}
        >
          <ScrollAreaContent style={{ display: "table", minWidth: "100%" }}>
            {children}
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollBar />
        <ScrollAreaCorner />
      </HorizontalContext>
    </ScrollAreaPrimitive>
  );
};
ScrollArea.displayName = "ScrollArea";

const ScrollBar = ({
  className,
  forceMount: _forceMount,
  orientation = "vertical",
  ref,
  render,
  ...props
}: React.ComponentProps<typeof ScrollAreaScrollbar> & {
  /** Accepted for compatibility: the scrollbar always stays mounted. */
  forceMount?: true;
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const setHorizontal = React.use(HorizontalContext);
  const isHorizontal = orientation === "horizontal";
  React.useEffect(() => {
    if (!isHorizontal || !setHorizontal) return;
    setHorizontal(true);
    return () => {
      setHorizontal(false);
    };
  }, [isHorizontal, setHorizontal]);

  return (
    <ScrollAreaScrollbar
      className={cn(
        "invisible flex touch-none select-none transition-colors data-[visible]:visible",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent p-[1px]",
        className,
      )}
      orientation={orientation}
      ref={ref}
      render={withDataAttributes("div", visibleState, render)}
      {...props}
    >
      <ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaScrollbar>
  );
};
ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
