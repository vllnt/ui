"use client";

import * as React from "react";

import { cn } from "../../../lib/utils";

/** Props for {@link SpotlightCard}. */
export type SpotlightCardProps = React.ComponentPropsWithoutRef<"div">;

type Point = { x: number; y: number };

/**
 * Card with a radial spotlight that tracks the pointer across its surface.
 *
 * @example
 * ```tsx
 * <SpotlightCard>Hover me</SpotlightCard>
 * ```
 */
export const SpotlightCard = ({
  children,
  className,
  ref,
  ...props
}: SpotlightCardProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const spotlight = React.useRef<HTMLSpanElement>(null);
  const pointer = React.useRef<Point>({ x: 0, y: 0 });
  const frame = React.useRef<null | number>(null);

  React.useEffect(() => {
    return () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, []);

  const moveSpotlight = (): void => {
    frame.current = null;
    const node = spotlight.current;
    if (!node?.parentElement) {
      return;
    }

    const bounds = node.parentElement.getBoundingClientRect();
    const x = pointer.current.x - bounds.left;
    const y = pointer.current.y - bounds.top;
    node.style.background = `radial-gradient(180px circle at ${x}px ${y}px, oklch(var(--foreground) / 0.10), transparent 65%)`;
    node.style.opacity = "1";
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    pointer.current = { x: event.clientX, y: event.clientY };
    frame.current ??= requestAnimationFrame(moveSpotlight);
  };

  const handlePointerLeave = (): void => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    if (spotlight.current) {
      spotlight.current.style.background = "";
      spotlight.current.style.opacity = "0";
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-6",
        className,
      )}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={ref}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        ref={spotlight}
        style={{ opacity: 0 }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
SpotlightCard.displayName = "SpotlightCard";
