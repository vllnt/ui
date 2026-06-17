"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

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
  const [point, setPoint] = React.useState<Point | undefined>();

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPoint({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  };

  const handlePointerLeave = (): void => {
    setPoint(undefined);
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
        style={{
          background: point
            ? `radial-gradient(180px circle at ${point.x}px ${point.y}px, oklch(var(--foreground) / 0.10), transparent 65%)`
            : undefined,
          opacity: point ? 1 : 0,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
SpotlightCard.displayName = "SpotlightCard";
