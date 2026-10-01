"use client";

import * as React from "react";

import { cn } from "../../../lib/utils";

export const UNICODE_SPINNER_PRESETS = {
  arc: {
    frames: ["◜", "◠", "◝", "◞", "◡", "◟"],
    interval: 100,
  },
  arrow: {
    frames: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"],
    interval: 100,
  },
  balloon: {
    frames: [".", "o", "O", "o", "."],
    interval: 120,
  },
  bounce: {
    frames: ["⠁", "⠂", "⠄", "⡀", "⠄", "⠂"],
    interval: 120,
  },
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
  "circle-halves": {
    frames: ["◐", "◓", "◑", "◒"],
    interval: 50,
  },
  "circle-quarters": {
    frames: ["◴", "◷", "◶", "◵"],
    interval: 120,
  },
  clock: {
    frames: [
      "🕛",
      "🕐",
      "🕑",
      "🕒",
      "🕓",
      "🕔",
      "🕕",
      "🕖",
      "🕗",
      "🕘",
      "🕙",
      "🕚",
    ],
    interval: 100,
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
  dots: {
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
    interval: 80,
  },
  dots2: {
    frames: ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
    interval: 80,
  },
  dots3: {
    frames: ["⠋", "⠙", "⠚", "⠞", "⠖", "⠦", "⠴", "⠲", "⠳", "⠓"],
    interval: 80,
  },
  dots4: {
    frames: [
      "⠄",
      "⠆",
      "⠇",
      "⠋",
      "⠙",
      "⠸",
      "⠰",
      "⠠",
      "⠰",
      "⠸",
      "⠙",
      "⠋",
      "⠇",
      "⠆",
    ],
    interval: 80,
  },
  dots5: {
    frames: [
      "⠋",
      "⠙",
      "⠚",
      "⠒",
      "⠂",
      "⠂",
      "⠒",
      "⠲",
      "⠴",
      "⠦",
      "⠖",
      "⠒",
      "⠐",
      "⠐",
      "⠒",
      "⠓",
      "⠋",
    ],
    interval: 80,
  },
  dots6: {
    frames: [
      "⠁",
      "⠉",
      "⠙",
      "⠚",
      "⠒",
      "⠂",
      "⠂",
      "⠒",
      "⠲",
      "⠴",
      "⠤",
      "⠄",
      "⠄",
      "⠤",
      "⠴",
      "⠲",
      "⠒",
      "⠂",
      "⠂",
      "⠒",
      "⠚",
      "⠙",
      "⠉",
      "⠁",
    ],
    interval: 80,
  },
  dots7: {
    frames: [
      "⠈",
      "⠉",
      "⠋",
      "⠓",
      "⠒",
      "⠐",
      "⠐",
      "⠒",
      "⠖",
      "⠦",
      "⠤",
      "⠠",
      "⠠",
      "⠤",
      "⠦",
      "⠖",
      "⠒",
      "⠐",
      "⠐",
      "⠒",
      "⠓",
      "⠋",
      "⠉",
      "⠈",
    ],
    interval: 80,
  },
  dots8: {
    frames: [
      "⠁",
      "⠁",
      "⠉",
      "⠙",
      "⠚",
      "⠒",
      "⠂",
      "⠂",
      "⠒",
      "⠲",
      "⠴",
      "⠤",
      "⠄",
      "⠄",
      "⠤",
      "⠠",
      "⠠",
      "⠤",
      "⠦",
      "⠖",
      "⠒",
      "⠐",
      "⠐",
      "⠒",
      "⠓",
      "⠋",
      "⠉",
      "⠈",
      "⠈",
    ],
    interval: 80,
  },
  dots9: {
    frames: ["⢹", "⢺", "⢼", "⣸", "⣇", "⡧", "⡗", "⡏"],
    interval: 80,
  },
  dots10: {
    frames: ["⢄", "⢂", "⢁", "⡁", "⡈", "⡐", "⡠"],
    interval: 80,
  },
  dots11: {
    frames: ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"],
    interval: 100,
  },
  dots12: {
    frames: [
      "⢀⠀",
      "⡀⠀",
      "⠄⠀",
      "⢂⠀",
      "⡂⠀",
      "⠅⠀",
      "⢃⠀",
      "⡃⠀",
      "⠍⠀",
      "⢋⠀",
      "⡋⠀",
      "⠍⠁",
      "⢋⠁",
      "⡋⠁",
      "⠍⠉",
      "⠋⠉",
      "⠋⠉",
      "⠉⠙",
      "⠉⠙",
      "⠉⠩",
      "⠈⢙",
      "⠈⡙",
      "⢈⠩",
      "⡀⢙",
      "⠄⡙",
      "⢂⠩",
      "⡂⢘",
      "⠅⡘",
      "⢃⠨",
      "⡃⢐",
      "⠍⡐",
      "⢋⠠",
      "⡋⢀",
      "⠍⡁",
      "⢋⠁",
      "⡋⠁",
      "⠍⠉",
      "⠋⠉",
      "⠋⠉",
      "⠉⠙",
      "⠉⠙",
      "⠉⠩",
      "⠈⢙",
      "⠈⡙",
      "⠈⠩",
      "⠀⢙",
      "⠀⡙",
      "⠀⠩",
      "⠀⢘",
      "⠀⡘",
      "⠀⠨",
      "⠀⢐",
      "⠀⡐",
      "⠀⠠",
      "⠀⢀",
      "⠀⡀",
    ],
    interval: 80,
  },
  dots13: {
    frames: ["⣼", "⣹", "⢻", "⠿", "⡟", "⣏", "⣧", "⣶"],
    interval: 80,
  },
  dots14: {
    frames: [
      "⠉⠉",
      "⠈⠙",
      "⠀⠹",
      "⠀⢸",
      "⠀⣰",
      "⢀⣠",
      "⣀⣀",
      "⣄⡀",
      "⣆⠀",
      "⡇⠀",
      "⠏⠀",
      "⠋⠁",
    ],
    interval: 80,
  },
  "dots-circle": {
    frames: ["⢎⠀", "⠎⠁", "⠊⠑", "⠈⠱", "⠀⡱", "⢀⡰", "⢄⡠", "⢆⡀"],
    interval: 80,
  },
  "double-arrow": {
    frames: ["⇐", "⇖", "⇑", "⇗", "⇒", "⇘", "⇓", "⇙"],
    interval: 100,
  },
  dqpb: {
    frames: ["d", "q", "p", "b"],
    interval: 100,
  },
  earth: {
    frames: ["🌍", "🌎", "🌏"],
    interval: 180,
  },
  fillsweep: {
    frames: ["⣀⣀", "⣤⣤", "⣶⣶", "⣿⣿", "⣿⣿", "⣿⣿", "⣶⣶", "⣤⣤", "⣀⣀", "⠀⠀", "⠀⠀"],
    interval: 100,
  },
  "grow-horizontal": {
    frames: ["▏", "▎", "▍", "▌", "▋", "▊", "▉", "▊", "▋", "▌", "▍", "▎"],
    interval: 120,
  },
  "grow-vertical": {
    frames: ["▁", "▃", "▄", "▅", "▆", "▇", "▆", "▅", "▄", "▃"],
    interval: 120,
  },
  hearts: {
    frames: ["🩷", "🧡", "💛", "💚", "💙", "🩵", "💜", "🤎", "🖤", "🩶", "🤍"],
    interval: 120,
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
  moon: {
    frames: ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"],
    interval: 80,
  },
  noise: {
    frames: ["▓", "▒", "░", " ", "░", "▒"],
    interval: 100,
  },
  orbit: {
    frames: ["⠃", "⠉", "⠘", "⠰", "⢠", "⣀", "⡄", "⠆"],
    interval: 100,
  },
  point: {
    frames: ["···", "•··", "·•·", "··•", "···"],
    interval: 200,
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
  "rolling-line": {
    frames: ["/", "-", "\\", "|", "\\", "-"],
    interval: 80,
  },
  sand: {
    frames: [
      "⠁",
      "⠂",
      "⠄",
      "⡀",
      "⡈",
      "⡐",
      "⡠",
      "⣀",
      "⣁",
      "⣂",
      "⣄",
      "⣌",
      "⣔",
      "⣤",
      "⣥",
      "⣦",
      "⣮",
      "⣶",
      "⣷",
      "⣿",
      "⡿",
      "⠿",
      "⢟",
      "⠟",
      "⡛",
      "⠛",
      "⠫",
      "⢋",
      "⠋",
      "⠍",
      "⡉",
      "⠉",
      "⠑",
      "⠡",
      "⢁",
    ],
    interval: 80,
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
  "simple-dots": {
    frames: [".  ", ".. ", "...", "   "],
    interval: 400,
  },
  "simple-dots-scrolling": {
    frames: [".  ", ".. ", "...", " ..", "  .", "   "],
    interval: 200,
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
  speaker: {
    frames: ["🔈", "🔉", "🔊", "🔉"],
    interval: 160,
  },
  "square-corners": {
    frames: ["◰", "◳", "◲", "◱"],
    interval: 180,
  },
  toggle: {
    frames: ["⊶", "⊷"],
    interval: 250,
  },
  triangle: {
    frames: ["◢", "◣", "◤", "◥"],
    interval: 50,
  },
  wave: {
    frames: ["⠁⠂⠄⡀", "⠂⠄⡀⢀", "⠄⡀⢀⠠", "⡀⢀⠠⠐", "⢀⠠⠐⠈", "⠠⠐⠈⠁", "⠐⠈⠁⠂", "⠈⠁⠂⠄"],
    interval: 100,
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
  weather: {
    frames: ["☀️", "🌤", "⛅️", "🌥", "☁️", "🌧", "🌨", "⛈"],
    interval: 100,
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

export const UnicodeSpinner = ({
  animation = "braille",
  className,
  interval,
  label,
  paused = false,
  ref,
  size = "md",
  ...props
}: UnicodeSpinnerProps & { ref?: React.Ref<HTMLSpanElement> }) => {
  const preset = UNICODE_SPINNER_PRESETS[animation];
  const resolvedInterval = interval ?? preset.interval;
  const [frameIndex, setFrameIndex] = React.useState(0);
  const [previousAnimation, setPreviousAnimation] = React.useState(
    () => animation,
  );

  if (previousAnimation !== animation) {
    setPreviousAnimation(animation);
    setFrameIndex(0);
  }

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
};

UnicodeSpinner.displayName = "UnicodeSpinner";
