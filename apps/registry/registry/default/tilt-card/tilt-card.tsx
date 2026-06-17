"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link TiltCard}. */
export type TiltCardProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Peak rotation in degrees applied at the card edges. Defaults to `12`. */
  maxTilt?: number;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (): void => {
      setReduced(query.matches);
    };

    onChange();
    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
    };
  }, []);

  return reduced;
}

function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, -max), max);
}

/**
 * Card that tilts in 3D toward the pointer for a parallax hover effect.
 *
 * Respects `prefers-reduced-motion`: the card stays flat.
 *
 * @example
 * ```tsx
 * <TiltCard className="rounded-xl border bg-card p-6">Hover me</TiltCard>
 * ```
 */
export const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(
  ({ children, className, maxTilt = 12, style, ...props }, ref) => {
    const reduced = usePrefersReducedMotion();
    const [transform, setTransform] = React.useState<string>();

    const handlePointerMove = (
      event: React.PointerEvent<HTMLDivElement>,
    ): void => {
      if (reduced) {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
      const rotateY = clamp(offsetX * maxTilt * 2, maxTilt);
      const rotateX = clamp(-offsetY * maxTilt * 2, maxTilt);

      setTransform(
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      );
    };

    return (
      <div
        className={cn(
          "transition-transform duration-200 ease-out will-change-transform",
          className,
        )}
        onPointerLeave={() => {
          setTransform(undefined);
        }}
        onPointerMove={handlePointerMove}
        ref={ref}
        style={{ transform, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TiltCard.displayName = "TiltCard";
