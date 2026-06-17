import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link DotPattern}. */
export type DotPatternProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Dot radius in pixels. Defaults to `1`. */
  dotRadius?: number;
  /** Fade the pattern toward the edges with a radial mask. Defaults to `true`. */
  fade?: boolean;
  /** Grid spacing between dots in pixels. Defaults to `16`. */
  spacing?: number;
};

const fadeMask = "radial-gradient(ellipse at center, black, transparent 75%)";

/**
 * Static dotted background painted with a repeating radial gradient.
 *
 * @example
 * ```tsx
 * <DotPattern spacing={24} />
 * ```
 */
export const DotPattern = React.forwardRef<HTMLDivElement, DotPatternProps>(
  (
    { className, dotRadius = 1, fade = true, spacing = 16, style, ...props },
    ref,
  ) => {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 text-muted-foreground/40",
          className,
        )}
        ref={ref}
        style={{
          backgroundImage: `radial-gradient(currentColor ${dotRadius}px, transparent ${dotRadius}px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
          maskImage: fade ? fadeMask : undefined,
          WebkitMaskImage: fade ? fadeMask : undefined,
          ...style,
        }}
        {...props}
      />
    );
  },
);
DotPattern.displayName = "DotPattern";
