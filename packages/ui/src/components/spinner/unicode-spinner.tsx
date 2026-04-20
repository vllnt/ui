import * as React from "react";

import { cn } from "../../lib/utils";

export const UNICODE_SPINNER_PRESETS = {
  braille: {
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
    interval: 80,
  },
  braillewave: {
    frames: ["⠁⠂⠄⡀", "⠂⠄⡀⢀", "⠄⡀⢀⠠", "⡀⢀⠠⠐", "⢀⠠⠐⠈", "⠠⠐⠈⠁", "⠐⠈⠁⠂", "⠈⠁⠂⠄"],
    interval: 100,
  },
  breathe: {
    frames: [
      "⠀",
      "⠂",
      "⠌",
      "⡑",
      "⢕",
      "⢝",
      "⣫",
      "⣟",
      "⣿",
      "⣟",
      "⣫",
      "⢝",
      "⢕",
      "⡑",
      "⠌",
      "⠂",
      "⠀",
    ],
    interval: 100,
  },
  cascade: {
    frames: [
      "⠀⠀⠀⠀",
      "⠀⠀⠀⠀",
      "⠁⠀⠀⠀",
      "⠋⠀⠀⠀",
      "⠞⠁⠀⠀",
      "⡴⠋⠀⠀",
      "⣠⠞⠁⠀",
      "⢀⡴⠋⠀",
      "⠀⣠⠞⠁",
      "⠀⢀⡴⠋",
      "⠀⠀⣠⠞",
      "⠀⠀⢀⡴",
      "⠀⠀⠀⣠",
      "⠀⠀⠀⢀",
    ],
    interval: 60,
  },
  checkerboard: {
    frames: ["⢕⢕⢕", "⡪⡪⡪", "⢊⠔⡡", "⡡⢊⠔"],
    interval: 250,
  },
  columns: {
    frames: [
      "⡀⠀⠀",
      "⡄⠀⠀",
      "⡆⠀⠀",
      "⡇⠀⠀",
      "⣇⠀⠀",
      "⣧⠀⠀",
      "⣷⠀⠀",
      "⣿⠀⠀",
      "⣿⡀⠀",
      "⣿⡄⠀",
      "⣿⡆⠀",
      "⣿⡇⠀",
      "⣿⣇⠀",
      "⣿⣧⠀",
      "⣿⣷⠀",
      "⣿⣿⠀",
      "⣿⣿⡀",
      "⣿⣿⡄",
      "⣿⣿⡆",
      "⣿⣿⡇",
      "⣿⣿⣇",
      "⣿⣿⣧",
      "⣿⣿⣷",
      "⣿⣿⣿",
      "⣿⣿⣿",
      "⠀⠀⠀",
    ],
    interval: 60,
  },
  diagswipe: {
    frames: [
      "⠁⠀",
      "⠋⠀",
      "⠟⠁",
      "⡿⠋",
      "⣿⠟",
      "⣿⡿",
      "⣿⣿",
      "⣿⣿",
      "⣾⣿",
      "⣴⣿",
      "⣠⣾",
      "⢀⣴",
      "⠀⣠",
      "⠀⢀",
      "⠀⠀",
      "⠀⠀",
    ],
    interval: 60,
  },
  dna: {
    frames: [
      "⠋⠉⠙⠚",
      "⠉⠙⠚⠒",
      "⠙⠚⠒⠂",
      "⠚⠒⠂⠂",
      "⠒⠂⠂⠒",
      "⠂⠂⠒⠲",
      "⠂⠒⠲⠴",
      "⠒⠲⠴⠤",
      "⠲⠴⠤⠄",
      "⠴⠤⠄⠋",
      "⠤⠄⠋⠉",
      "⠄⠋⠉⠙",
    ],
    interval: 80,
  },
  fillsweep: {
    frames: ["⣀⣀", "⣤⣤", "⣶⣶", "⣿⣿", "⣿⣿", "⣿⣿", "⣶⣶", "⣤⣤", "⣀⣀", "⠀⠀", "⠀⠀"],
    interval: 100,
  },
  helix: {
    frames: [
      "⢌⣉⢎⣉",
      "⣉⡱⣉⡱",
      "⣉⢎⣉⢎",
      "⡱⣉⡱⣉",
      "⢎⣉⢎⣉",
      "⣉⡱⣉⡱",
      "⣉⢎⣉⢎",
      "⡱⣉⡱⣉",
      "⢎⣉⢎⣉",
      "⣉⡱⣉⡱",
      "⣉⢎⣉⢎",
      "⡱⣉⡱⣉",
      "⢎⣉⢎⣉",
      "⣉⡱⣉⡱",
      "⣉⢎⣉⢎",
      "⡱⣉⡱⣉",
    ],
    interval: 80,
  },
  orbit: {
    frames: ["⠃", "⠉", "⠘", "⠰", "⢠", "⣀", "⡄", "⠆"],
    interval: 100,
  },
  pulse: {
    frames: ["⠀⠶⠀", "⠰⣿⠆", "⢾⣉⡷", "⣏⠀⣹", "⡁⠀⢈"],
    interval: 180,
  },
  rain: {
    frames: [
      "⢁⠂⠔⠈",
      "⠂⠌⡠⠐",
      "⠄⡐⢀⠡",
      "⡈⠠⠀⢂",
      "⠐⢀⠁⠄",
      "⠠⠁⠊⡀",
      "⢁⠂⠔⠈",
      "⠂⠌⡠⠐",
      "⠄⡐⢀⠡",
      "⡈⠠⠀⢂",
      "⠐⢀⠁⠄",
      "⠠⠁⠊⡀",
    ],
    interval: 100,
  },
  scan: {
    frames: [
      "⠀⠀⠀⠀",
      "⡇⠀⠀⠀",
      "⣿⠀⠀⠀",
      "⢸⡇⠀⠀",
      "⠀⣿⠀⠀",
      "⠀⢸⡇⠀",
      "⠀⠀⣿⠀",
      "⠀⠀⢸⡇",
      "⠀⠀⠀⣿",
      "⠀⠀⠀⢸",
    ],
    interval: 70,
  },
  scanline: {
    frames: ["⠉⠉⠉", "⠓⠓⠓", "⠦⠦⠦", "⣄⣄⣄", "⠦⠦⠦", "⠓⠓⠓"],
    interval: 120,
  },
  snake: {
    frames: [
      "⣁⡀",
      "⣉⠀",
      "⡉⠁",
      "⠉⠉",
      "⠈⠙",
      "⠀⠛",
      "⠐⠚",
      "⠒⠒",
      "⠖⠂",
      "⠶⠀",
      "⠦⠄",
      "⠤⠤",
      "⠠⢤",
      "⠀⣤",
      "⢀⣠",
      "⣀⣀",
    ],
    interval: 80,
  },
  sparkle: {
    frames: ["⡡⠊⢔⠡", "⠊⡰⡡⡘", "⢔⢅⠈⢢", "⡁⢂⠆⡍", "⢔⠨⢑⢐", "⠨⡑⡠⠊"],
    interval: 150,
  },
  waverows: {
    frames: [
      "⠖⠉⠉⠑",
      "⡠⠖⠉⠉",
      "⣠⡠⠖⠉",
      "⣄⣠⡠⠖",
      "⠢⣄⣠⡠",
      "⠙⠢⣄⣠",
      "⠉⠙⠢⣄",
      "⠊⠉⠙⠢",
      "⠜⠊⠉⠙",
      "⡤⠜⠊⠉",
      "⣀⡤⠜⠊",
      "⢤⣀⡤⠜",
      "⠣⢤⣀⡤",
      "⠑⠣⢤⣀",
      "⠉⠑⠣⢤",
      "⠋⠉⠑⠣",
    ],
    interval: 90,
  },
} as const;

export const UNICODE_SPINNER_ANIMATIONS = Object.keys(
  UNICODE_SPINNER_PRESETS,
) as (keyof typeof UNICODE_SPINNER_PRESETS)[];

const UNICODE_SPINNER_SIZE_CLASSES = {
  lg: "text-2xl",
  md: "text-lg",
  sm: "text-sm",
} as const;

export type UnicodeSpinnerAnimation = keyof typeof UNICODE_SPINNER_PRESETS;

export type UnicodeSpinnerProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "children"
> & {
  animation?: UnicodeSpinnerAnimation;
  interval?: number;
  label?: string;
  paused?: boolean;
  size?: keyof typeof UNICODE_SPINNER_SIZE_CLASSES;
};

export const UnicodeSpinner = React.forwardRef<
  HTMLSpanElement,
  UnicodeSpinnerProps
>(
  (
    {
      animation = "braille",
      className,
      interval,
      label,
      paused = false,
      size = "md",
      ...props
    },
    ref,
  ) => {
    const preset = UNICODE_SPINNER_PRESETS[animation];
    const resolvedInterval = interval ?? preset.interval;
    const [frameIndex, setFrameIndex] = React.useState(0);

    React.useEffect(() => {
      setFrameIndex(0);
    }, [animation]);

    React.useEffect(() => {
      if (paused) {
        return;
      }

      const timer = window.setInterval(() => {
        setFrameIndex((current) => (current + 1) % preset.frames.length);
      }, resolvedInterval);

      return () => {
        window.clearInterval(timer);
      };
    }, [paused, preset.frames.length, resolvedInterval]);

    const frame = preset.frames[frameIndex] ?? preset.frames[0] ?? "⠋";
    const accessibleLabel = label ? `Loading ${label}` : "Loading";

    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 font-mono leading-none text-foreground",
          UNICODE_SPINNER_SIZE_CLASSES[size],
          className,
        )}
        ref={ref}
        role="status"
        {...props}
      >
        <span
          aria-hidden="true"
          className="inline-block min-w-[1em] whitespace-pre"
        >
          {frame}
        </span>
        {label ? (
          <span className="text-sm font-medium text-foreground">{label}</span>
        ) : null}
        <span className="sr-only">{accessibleLabel}</span>
      </span>
    );
  },
);

UnicodeSpinner.displayName = "UnicodeSpinner";
