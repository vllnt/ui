"use client";

import * as React from "react";

import { Pause, Play } from "lucide-react";

import { cn } from "../../../lib/utils";

export type MarqueeSpeed = "fast" | "normal" | "slow";

/** Localizable labels for the {@link Marquee} pause control. */
export type MarqueeLabels = {
  /** Accessible name of the control while scrolling. Defaults to `"Pause"`. */
  pause?: string;
  /** Accessible name of the control while paused. Defaults to `"Play"`. */
  play?: string;
};

export type MarqueeProps = React.ComponentPropsWithoutRef<"div"> & {
  duration?: number;
  fade?: boolean;
  gap?: number | string;
  /** Labels for the pause control. */
  labels?: MarqueeLabels;
  /**
   * Render a keyboard-operable pause / play button (WCAG 2.2.2). Defaults to
   * `true`; set `false` when the host page offers its own control.
   */
  pauseControl?: boolean;
  pauseOnHover?: boolean;
  repeat?: number;
  reverse?: boolean;
  speed?: MarqueeSpeed;
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

function getDuration(
  duration: number | undefined,
  speed: MarqueeSpeed,
): number {
  if (duration !== undefined) {
    return duration;
  }

  switch (speed) {
    case "fast":
      return 10;
    case "normal":
      return 20;
    case "slow":
      return 32;
  }
}

type PauseToggleProps = {
  labels: Required<MarqueeLabels>;
  onToggle: () => void;
  paused: boolean;
};

function PauseToggle({ labels, onToggle, paused }: PauseToggleProps) {
  return (
    <button
      aria-label={paused ? labels.play : labels.pause}
      className="absolute right-1 top-1 z-10 inline-flex size-6 items-center justify-center rounded-md border border-border bg-background/90 text-foreground shadow-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hidden"
      onClick={onToggle}
      type="button"
    >
      {paused ? (
        <Play aria-hidden="true" className="size-3" />
      ) : (
        <Pause aria-hidden="true" className="size-3" />
      )}
    </button>
  );
}

type MarqueeTrackProps = {
  gap: string;
  items: React.ReactNode[];
  paused: boolean;
  pauseOnHover: boolean;
  style: React.CSSProperties;
  vertical: boolean;
};

function MarqueeTrack({
  gap,
  items,
  paused,
  pauseOnHover,
  style,
  vertical,
}: MarqueeTrackProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 will-change-transform [animation-iteration-count:infinite] [animation-timing-function:linear] focus-within:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:transform-none",
        vertical
          ? "[animation-name:vllnt-marquee-y]"
          : "[animation-name:vllnt-marquee-x]",
        pauseOnHover && "group-hover:[animation-play-state:paused]",
        paused && "[animation-play-state:paused]",
        vertical ? "min-h-full flex-col" : "min-w-full flex-row",
      )}
      data-marquee-track=""
      style={style}
    >
      {[0, 1].map((groupIndex) => (
        <div
          aria-hidden={groupIndex === 1}
          className={cn(
            "flex shrink-0",
            vertical ? "flex-col items-stretch" : "flex-row items-center",
          )}
          key={groupIndex}
          style={{ gap }}
        >
          {items}
        </div>
      ))}
    </div>
  );
}

/**
 * Infinitely scrolling row or column. The scroll stops under
 * `prefers-reduced-motion`, pauses while focus is inside it, and offers a
 * pause / play button (WCAG 2.2.2 Pause, Stop, Hide).
 */
export const Marquee = ({
  children,
  className,
  duration,
  fade = true,
  gap = "1rem",
  labels,
  pauseControl = true,
  pauseOnHover = false,
  ref,
  repeat = 1,
  reverse = false,
  speed = "normal",
  style,
  vertical = false,
  ...props
}: MarqueeProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [paused, setPaused] = React.useState(false);
  const resolvedGap = getGapValue(gap);
  const resolvedDuration = getDuration(duration, speed);
  const trackItems = getTrackItems(children, repeat);

  const animationStyle: React.CSSProperties = {
    animationDirection: reverse ? "reverse" : "normal",
    animationDuration: `${resolvedDuration.toString()}s`,
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
      style={style}
      {...props}
    >
      {pauseControl ? (
        <PauseToggle
          labels={{ pause: "Pause", play: "Play", ...labels }}
          onToggle={() => {
            setPaused((value) => !value);
          }}
          paused={paused}
        />
      ) : null}
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 overflow-hidden",
          vertical ? "flex-col" : "flex-row",
        )}
        style={fade ? { maskImage, WebkitMaskImage: maskImage } : undefined}
      >
        <MarqueeTrack
          gap={resolvedGap}
          items={trackItems}
          paused={paused}
          pauseOnHover={pauseOnHover}
          style={animationStyle}
          vertical={vertical}
        />
      </div>
    </div>
  );
};

Marquee.displayName = "Marquee";
