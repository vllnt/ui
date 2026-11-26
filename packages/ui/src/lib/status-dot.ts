import { cva } from "./variants";

/**
 * Tones that colour a status dot. The chip around the dot stays neutral and
 * its label stays foreground.
 */
export const STATUS_TONES = [
  "danger",
  "info",
  "neutral",
  "primary",
  "success",
  "warning",
] as const;

/** One of {@link STATUS_TONES}. */
export type StatusTone = (typeof STATUS_TONES)[number];

const STATUS_TONE_SET: ReadonlySet<unknown> = new Set(STATUS_TONES);

/** Narrow a value to a {@link StatusTone}. */
export function isStatusTone(value: unknown): value is StatusTone {
  return STATUS_TONE_SET.has(value);
}

/**
 * Classes for a 6px status dot. The dot draws with `currentColor`, so a tone
 * sets the colour on the dot and leaves the label alone. Without a tone the
 * dot follows the label colour.
 */
export const statusDotVariants = cva(
  "size-1.5 shrink-0 rounded-full bg-current",
  {
    variants: {
      tone: {
        danger: "text-destructive",
        info: "text-info",
        neutral: "text-muted-foreground",
        primary: "text-primary",
        success: "text-success",
        warning: "text-warning",
      },
    },
  },
);
