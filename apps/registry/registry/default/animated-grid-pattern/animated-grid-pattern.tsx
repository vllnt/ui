"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link AnimatedGridPattern}. */
export type AnimatedGridPatternProps = React.ComponentPropsWithoutRef<"svg"> & {
  /** Cell height in pixels. Defaults to `40`. */
  height?: number;
  /** Count of pulsing highlighted cells. Defaults to `24`. */
  squares?: number;
  /** Cell width in pixels. Defaults to `40`. */
  width?: number;
};

type Square = {
  delay: number;
  duration: number;
  x: number;
  y: number;
};

function createSquares(count: number): Square[] {
  return Array.from({ length: count }, () => ({
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    x: Math.floor(Math.random() * 40),
    y: Math.floor(Math.random() * 40),
  }));
}

function GridSquare({
  height,
  square,
  width,
}: {
  height: number;
  square: Square;
  width: number;
}) {
  return (
    <rect
      className="animate-pulse fill-foreground/10 motion-reduce:animate-none"
      height={height - 1}
      style={{
        animationDelay: `${square.delay}s`,
        animationDuration: `${square.duration}s`,
      }}
      width={width - 1}
      x={square.x * width + 1}
      y={square.y * height + 1}
    />
  );
}

/**
 * Animated SVG grid with cells that pulse in and out at staggered intervals.
 *
 * Respects `prefers-reduced-motion`: the cells hold a steady fill.
 *
 * @example
 * ```tsx
 * <AnimatedGridPattern squares={32} />
 * ```
 */
export const AnimatedGridPattern = ({
  className,
  height = 40,
  ref,
  squares = 24,
  width = 40,
  ...props
}: AnimatedGridPatternProps & { ref?: React.Ref<SVGSVGElement> }) => {
  const [cells] = React.useState(() => createSquares(squares));
  const patternId = React.useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-border",
        className,
      )}
      ref={ref}
      {...props}
    >
      <defs>
        <pattern
          height={height}
          id={patternId}
          patternUnits="userSpaceOnUse"
          width={width}
        >
          <path
            d={`M ${String(width)} 0 L 0 0 0 ${String(height)}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
          />
        </pattern>
      </defs>
      <rect fill={`url(#${patternId})`} height="100%" width="100%" />
      {cells.map((square, index) => (
        <GridSquare height={height} key={index} square={square} width={width} />
      ))}
    </svg>
  );
};
AnimatedGridPattern.displayName = "AnimatedGridPattern";
