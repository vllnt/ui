import * as React from "react";

import type { MaterialProps } from "../../../lib/material";
import { cn } from "../../../lib/utils";

/** Side the blur ramps toward. */
export type ProgressiveBlurDirection = "bottom" | "left" | "right" | "top";

/** Props for {@link ProgressiveBlur}. */
export type ProgressiveBlurProps = MaterialProps &
  React.ComponentPropsWithoutRef<"div"> & {
    /**
     * Peak blur radius in pixels at the strongest layer. Defaults to `8`. The
     * radius never exceeds the `blur.glass.lg` token (24 px), and a solid
     * material draws no blur.
     */
    blur?: number;
    /** Side the blur ramps toward. Defaults to `"bottom"`. */
    direction?: ProgressiveBlurDirection;
    /** Count of stacked blur layers. Defaults to `5`. */
    layers?: number;
  };

function layerMask(direction: ProgressiveBlurDirection, index: number): string {
  const start = (index / 5) * 100;
  const mid = ((index + 1) / 5) * 100;
  return `linear-gradient(to ${direction}, transparent ${String(start)}%, black ${String(mid)}%)`;
}

/**
 * Stack of layers whose blur ramps progressively toward one side.
 *
 * @example
 * ```tsx
 * <ProgressiveBlur direction="bottom" blur={12} />
 * ```
 */
export const ProgressiveBlur = ({
  blur = 8,
  className,
  direction = "bottom",
  layers = 5,
  material = "glass",
  ref,
  ...props
}: ProgressiveBlurProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const bands = Array.from({ length: layers }, (_, index) => index);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      data-material={material}
      ref={ref}
      {...props}
    >
      {bands.map((index) => {
        const mask = layerMask(direction, index);
        const radius = `blur(min(${String(((index + 1) / layers) * blur)}px, var(--blur-glass-lg)))`;
        return (
          <div
            className="absolute inset-0"
            key={index}
            style={{
              backdropFilter: radius,
              maskImage: mask,
              WebkitBackdropFilter: radius,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
    </div>
  );
};
ProgressiveBlur.displayName = "ProgressiveBlur";
