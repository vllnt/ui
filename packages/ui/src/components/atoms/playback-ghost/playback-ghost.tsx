"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "../../../lib/utils";

/**
 * Object kind — drives the ghost glyph.
 *
 * @public
 */
export type PlaybackGhostKind =
  | "agent"
  | "artifact"
  | "input"
  | "output"
  | "run"
  | "task";

const KIND_GLYPH: Record<PlaybackGhostKind, string> = {
  agent: "◇",
  artifact: "◌",
  input: "↘",
  output: "↗",
  run: "▶",
  task: "▢",
};

const KIND_LABEL: Record<PlaybackGhostKind, string> = {
  agent: "Agent",
  artifact: "Artifact",
  input: "Input",
  output: "Output",
  run: "Run",
  task: "Task",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type PlaybackGhostLabels = {
  /** Aria-label override. Defaults to `"Playback ghost"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Playback ghost",
} as const satisfies Required<PlaybackGhostLabels>;

/**
 * Props for {@link PlaybackGhost}.
 *
 * @public
 */
export type PlaybackGhostProps = {
  /** Optional kind glyph + tooltip. */
  kind?: PlaybackGhostKind;
  /** Optional label rendered next to the glyph (e.g. id, run name). */
  label?: ReactNode;
  /** Localizable strings. */
  labels?: PlaybackGhostLabels;
  /**
   * Ghost frame opacity `0..1`. Defaults to `0.4`. The label keeps full
   * opacity so it stays readable (WCAG 1.4.3).
   */
  opacity?: number;
  /** Ghost size in pixels. Defaults to `40`. */
  size?: number;
  /** Center X in canvas pixels. */
  x: number;
  /** Center Y in canvas pixels. */
  y: number;
} & ComponentPropsWithoutRef<"div">;

const clamp01 = (v: number): number => {
  if (v < 0) {
    return 0;
  }
  if (v > 1) {
    return 1;
  }
  return v;
};

/**
 * Translucent overlay marking where a canvas object was at a previous
 * timestamp during state playback. Renders a kind glyph (and optional
 * label) at the historical position so the user can compare the
 * present canvas against earlier state without losing context.
 *
 * Pure presentation; the host computes the historical position from the
 * scrubbed timestamp. The wrapper is `pointer-events: none` so host
 * gestures pass through.
 *
 * @example
 * ```tsx
 * <div className="relative h-screen w-screen">
 *   <Canvas />
 *   <PlaybackGhost x={420} y={180} kind="run" label="research-2025" />
 * </div>
 * ```
 *
 * @public
 */
export const PlaybackGhost = ({
  ref,
  ...props
}: PlaybackGhostProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const {
    className,
    kind,
    label,
    labels,
    opacity = 0.4,
    size = 40,
    x,
    y,
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const safeOpacity = clamp01(opacity);
  const safeSize = size < 16 ? 16 : size;
  const ariaLabel = kind
    ? `${resolvedLabels.region}: ${KIND_LABEL[kind]}`
    : resolvedLabels.region;
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "pointer-events-none absolute z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground",
        className,
      )}
      data-playback-ghost
      data-playback-kind={kind ?? "unknown"}
      ref={ref}
      role="img"
      style={{
        left: x,
        minHeight: safeSize,
        minWidth: safeSize,
        top: y,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-md border border-dashed border-border/70 bg-background/40 backdrop-blur-sm"
        data-playback-ghost-frame
        style={{ opacity: safeOpacity }}
      />
      {kind ? (
        <span aria-hidden="true" className="relative">
          {KIND_GLYPH[kind]}
        </span>
      ) : null}
      {label ? (
        <span className="relative truncate" data-playback-ghost-label>
          {label}
        </span>
      ) : null}
    </div>
  );
};
PlaybackGhost.displayName = "PlaybackGhost";
