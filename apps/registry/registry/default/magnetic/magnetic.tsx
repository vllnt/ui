"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link Magnetic}. */
export type MagneticProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Fraction of the pointer offset applied as pull. Defaults to `0.4`. */
  strength?: number;
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

/**
 * Wrapper that drifts its content toward the pointer, then snaps back.
 *
 * Respects `prefers-reduced-motion`: the content stays put.
 *
 * @example
 * ```tsx
 * <Magnetic><img src="/logo.svg" alt="logo" /></Magnetic>
 * ```
 */
export const Magnetic = React.forwardRef<HTMLDivElement, MagneticProps>(
  ({ children, className, strength = 0.4, style, ...props }, ref) => {
    const reduced = usePrefersReducedMotion();
    const [transform, setTransform] = React.useState<string>();

    const handlePointerMove = (
      event: React.PointerEvent<HTMLDivElement>,
    ): void => {
      if (reduced) {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      const offsetX =
        (event.clientX - bounds.left - bounds.width / 2) * strength;
      const offsetY =
        (event.clientY - bounds.top - bounds.height / 2) * strength;

      setTransform(`translate(${offsetX}px, ${offsetY}px)`);
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
Magnetic.displayName = "Magnetic";
