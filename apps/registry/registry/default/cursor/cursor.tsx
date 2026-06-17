"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link Cursor}. */
export type CursorProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Diameter of the follower dot in pixels. Defaults to `24`. */
  size?: number;
};

type Point = {
  x: number;
  y: number;
};

function usePointerPosition(): Point | undefined {
  const [point, setPoint] = React.useState<Point>();

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onMove = (event: PointerEvent): void => {
      setPoint({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return point;
}

/**
 * Circular follower that tracks the pointer as a custom cursor overlay.
 *
 * Pointer tracking is direct feedback and keeps following under reduced
 * motion; `motion-reduce` drops the smoothing transition.
 *
 * @example
 * ```tsx
 * <Cursor size={32} />
 * ```
 */
export const Cursor = React.forwardRef<HTMLDivElement, CursorProps>(
  ({ className, size = 24, style, ...props }, ref) => {
    const point = usePointerPosition();

    return (
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground bg-foreground/20 backdrop-invert transition-transform duration-100 ease-out motion-reduce:transition-none",
          point ? "opacity-100" : "opacity-0",
          className,
        )}
        ref={ref}
        style={{
          height: `${size}px`,
          transform: point
            ? `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)`
            : undefined,
          width: `${size}px`,
          ...style,
        }}
        {...props}
      />
    );
  },
);
Cursor.displayName = "Cursor";
