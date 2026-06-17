import * as React from "react";

import { cn } from "@vllnt/ui";

/** Side the blur ramps toward. */
export type ProgressiveBlurDirection = "bottom" | "left" | "right" | "top";

/** Props for {@link ProgressiveBlur}. */
export type ProgressiveBlurProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Peak blur radius in pixels at the strongest layer. Defaults to `8`. */
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
      ref={ref}
      {...props}
    >
      {bands.map((index) => {
        const mask = layerMask(direction, index);
        return (
          <div
            className="absolute inset-0"
            key={index}
            style={{
              backdropFilter: `blur(${((index + 1) / layers) * blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
    </div>
  );
};
ProgressiveBlur.displayName = "ProgressiveBlur";
