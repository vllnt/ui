import * as React from "react";

import { cn } from "../../lib/utils";

export type MarqueeProps = React.ComponentPropsWithoutRef<"div"> & {
  duration?: number;
  fade?: boolean;
  gap?: number | string;
  pauseOnHover?: boolean;
  repeat?: number;
  reverse?: boolean;
  vertical?: boolean;
};

function getGapValue(gap: number | string): string {
  return typeof gap === "number" ? `${gap}px` : gap;
}

function getMaskImage(vertical: boolean): string {
  return vertical
    ? "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)"
    : "linear-gradient(to right, transparent, black 12%, black 88%, transparent)";
}

function getTrackItems(
  children: React.ReactNode,
  repeat: number,
): React.ReactNode[] {
  const items = React.Children.toArray(children);

  return Array.from({ length: Math.max(1, repeat) }, (_, copyIndex) =>
    items.map((item, itemIndex) => (
      <div className="shrink-0" key={`${copyIndex}-${itemIndex}`}>
        {item}
      </div>
    )),
  ).flat();
}

export const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      children,
      className,
      duration = 20,
      fade = true,
      gap = "1rem",
      pauseOnHover = false,
      repeat = 1,
      reverse = false,
      style,
      vertical = false,
      ...props
    },
    ref,
  ) => {
    const resolvedGap = getGapValue(gap);
    const trackItems = getTrackItems(children, repeat);

    const animationStyle: React.CSSProperties = {
      animationDirection: reverse ? "reverse" : "normal",
      animationDuration: `${duration}s`,
      animationIterationCount: "infinite",
      animationName: vertical ? "vllnt-marquee-y" : "vllnt-marquee-x",
      animationTimingFunction: "linear",
    };
    const maskImage = getMaskImage(vertical);

    return (
      <div
        className={cn(
          "group relative overflow-hidden",
          vertical ? "flex h-full flex-col" : "flex w-full flex-row",
          className,
        )}
        ref={ref}
        style={
          fade ? { ...style, maskImage, WebkitMaskImage: maskImage } : style
        }
        {...props}
      >
        <div
          className={cn(
            "flex shrink-0 will-change-transform motion-reduce:animate-none motion-reduce:transform-none",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            vertical ? "min-h-full flex-col" : "min-w-full flex-row",
          )}
          style={animationStyle}
        >
          {[0, 1].map((groupIndex) => (
            <div
              aria-hidden={groupIndex === 1}
              className={cn(
                "flex shrink-0",
                vertical ? "flex-col items-stretch" : "flex-row items-center",
              )}
              key={groupIndex}
              style={{ gap: resolvedGap }}
            >
              {trackItems}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

Marquee.displayName = "Marquee";
