"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

/**
 * Color theme for the follow ring + chip.
 *
 * @public
 */
export type FollowModeColor =
  | "amber"
  | "blue"
  | "emerald"
  | "purple"
  | "red"
  | "rose";

const PALETTE: Record<FollowModeColor, { chip: string; ring: string }> = {
  amber: { chip: "bg-amber-500 text-white", ring: "ring-amber-500" },
  blue: { chip: "bg-blue-500 text-white", ring: "ring-blue-500" },
  emerald: { chip: "bg-emerald-500 text-white", ring: "ring-emerald-500" },
  purple: { chip: "bg-purple-500 text-white", ring: "ring-purple-500" },
  red: { chip: "bg-red-500 text-white", ring: "ring-red-500" },
  rose: { chip: "bg-rose-500 text-white", ring: "ring-rose-500" },
};

/**
 * Localizable strings.
 *
 * @public
 */
export type FollowModeLabels = {
  /** Aria-label for the follow chrome. Defaults to `"Follow mode"`. */
  region?: string;
  /** Stop-following button copy. Defaults to `"Stop"`. */
  stop?: string;
};

const DEFAULT_LABELS = {
  region: "Follow mode",
  stop: "Stop",
} as const satisfies Required<FollowModeLabels>;

/**
 * Props for {@link FollowMode}.
 *
 * @public
 */
export type FollowModeProps = {
  /** Color theme. Defaults to `"blue"`. */
  color?: FollowModeColor;
  /** Localizable strings. */
  labels?: FollowModeLabels;
  /** Display name of the followed participant. */
  name: ReactNode;
  /** Fires when the user picks the stop-following button. */
  onStop?: () => void;
} & Omit<ComponentPropsWithoutRef<"div">, "color">;

/**
 * Follow-mode chrome. Wrap any region (typically the whole canvas) to
 * outline it with the followed participant's color and surface a
 * pinned chip + stop-following button. Pure presentation — the host
 * drives viewport sync and toggles the wrapper on / off.
 *
 * @example
 * ```tsx
 * <FollowMode color="emerald" name="Sam" onStop={stop}>
 *   <CanvasView … />
 * </FollowMode>
 * ```
 *
 * @public
 */
export const FollowMode = forwardRef<HTMLDivElement, FollowModeProps>(
  (props, ref) => {
    const {
      children,
      className,
      color = "blue",
      labels,
      name,
      onStop,
      ...rest
    } = props;
    const palette = PALETTE[color];
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    return (
      <div
        aria-label={resolvedLabels.region}
        className={cn(
          "relative h-full w-full rounded-2xl ring-2 ring-inset",
          palette.ring,
          className,
        )}
        data-follow-color={color}
        ref={ref}
        {...rest}
      >
        <div
          className="pointer-events-auto absolute left-1/2 top-2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold shadow-sm"
          data-follow-chip
        >
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5",
              palette.chip,
            )}
          >
            <span aria-hidden="true">▸</span>
            <span>Following {name}</span>
          </span>
          {onStop ? (
            <button
              aria-label={resolvedLabels.stop}
              className="inline-flex h-5 items-center rounded-full border border-border bg-background px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={onStop}
              type="button"
            >
              {resolvedLabels.stop}
            </button>
          ) : null}
        </div>
        {children}
      </div>
    );
  },
);
FollowMode.displayName = "FollowMode";
