import type { NativeTheme } from "@vllnt/ui-core";

/**
 * Tones that carry a status colour. They match the web `StatusTone` values the
 * Badge dot and the ProgressBar fill share.
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

type ColorName = keyof NativeTheme["colors"];

const STATUS_TONE_SET: ReadonlySet<unknown> = new Set(STATUS_TONES);

const STATUS_COLOR_NAME = {
  danger: "destructive",
  info: "info",
  neutral: "mutedForeground",
  primary: "primary",
  success: "success",
  warning: "warning",
} as const satisfies Record<StatusTone, ColorName>;

/**
 * Narrows a value to a {@link StatusTone}.
 *
 * @param value - Any value, such as a `tone` prop.
 * @returns Whether the value is one of the status tones.
 * @example
 * isStatusTone("success"); // true
 * isStatusTone("solid"); // false
 */
export function isStatusTone(value: unknown): value is StatusTone {
  return STATUS_TONE_SET.has(value);
}

/**
 * Looks up the theme colour of a status tone, the way the web classes
 * `bg-success` and `text-destructive` do.
 *
 * @param theme - The active native theme.
 * @param tone - A status tone.
 * @returns The theme colour for the tone.
 * @example
 * statusToneColor(theme, "danger"); // theme.colors.destructive
 */
export function statusToneColor(theme: NativeTheme, tone: StatusTone): string {
  return theme.colors[STATUS_COLOR_NAME[tone]];
}
