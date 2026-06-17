"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

/** Props for {@link MagneticButton}. */
export type MagneticButtonProps = React.ComponentPropsWithoutRef<"button"> & {
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
 * Button that drifts toward the pointer while hovered, then snaps back.
 *
 * Respects `prefers-reduced-motion`: the button stays put.
 *
 * @example
 * ```tsx
 * <MagneticButton>Hover me</MagneticButton>
 * ```
 */
export const MagneticButton = ({
  children,
  className,
  ref,
  strength = 0.4,
  style,
  ...props
}: MagneticButtonProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const reduced = usePrefersReducedMotion();
  const [transform, setTransform] = React.useState<string>();

  const handlePointerMove = (
    event: React.PointerEvent<HTMLButtonElement>,
  ): void => {
    if (reduced) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left - bounds.width / 2) * strength;
    const offsetY = (event.clientY - bounds.top - bounds.height / 2) * strength;

    setTransform(`translate(${offsetX}px, ${offsetY}px)`);
  };

  return (
    <button
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
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};
MagneticButton.displayName = "MagneticButton";
