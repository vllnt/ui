"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

/** Side of the trigger the tooltip appears on. */
export type TooltipSide = "bottom" | "top";

/** Props for {@link AnimatedTooltip}. */
export type AnimatedTooltipProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Trigger element that reveals the tooltip on hover or focus. */
  children: React.ReactNode;
  /** Content shown inside the tooltip bubble. */
  content: React.ReactNode;
  /** Side of the trigger the tooltip appears on. Defaults to `"top"`. */
  side?: TooltipSide;
};

function Tooltip({
  content,
  side,
}: {
  content: React.ReactNode;
  side: TooltipSide;
}) {
  return (
    <div
      className={cn(
        "absolute left-1/2 z-50 -translate-x-1/2 animate-in fade-in-0 zoom-in-95 whitespace-nowrap rounded-md border border-border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        side === "top" ? "bottom-full mb-2" : "top-full mt-2",
      )}
      role="tooltip"
    >
      {content}
    </div>
  );
}

/**
 * Trigger that reveals a tooltip bubble on hover or focus.
 *
 * The bubble scales and fades in; closing unmounts it.
 *
 * @example
 * ```tsx
 * <AnimatedTooltip content="Copied!"><button>Copy</button></AnimatedTooltip>
 * ```
 */
export const AnimatedTooltip = React.forwardRef<
  HTMLDivElement,
  AnimatedTooltipProps
>(({ children, className, content, side = "top", ...props }, ref) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div
      className={cn("relative inline-flex", className)}
      onBlur={() => {
        setOpen(false);
      }}
      onFocus={() => {
        setOpen(true);
      }}
      onPointerEnter={() => {
        setOpen(true);
      }}
      onPointerLeave={() => {
        setOpen(false);
      }}
      ref={ref}
      {...props}
    >
      {children}
      {open ? <Tooltip content={content} side={side} /> : undefined}
    </div>
  );
});
AnimatedTooltip.displayName = "AnimatedTooltip";
