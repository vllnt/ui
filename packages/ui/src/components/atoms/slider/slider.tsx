"use client";

import {
  Slider as SliderPrimitive,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider";
import type * as React from "react";

import { cn } from "../../../lib/utils";

/** Props a thumb takes besides its index and class. */
type SliderThumbProps = Omit<
  React.ComponentProps<typeof SliderThumb>,
  "className" | "index" | "render"
>;

type SliderProps = Omit<
  React.ComponentProps<typeof SliderPrimitive>,
  "controller" | "defaultValue" | "onValueChange" | "onValueCommit" | "value"
> & {
  /** Classes merged into the control, the box around the track that takes presses. */
  controlClassName?: string;
  defaultValue?: number[];
  /** Runs the way `dir="rtl"` does: the slider reads from the end side. Works on a horizontal slider. */
  inverted?: boolean;
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  /** Classes merged into the filled part of the track. */
  rangeClassName?: string;
  ref?: React.Ref<HTMLDivElement>;
  /** Classes merged into every thumb. */
  thumbClassName?: string;
  /**
   * Extra props for every thumb (for example its own `aria-label`, or
   * `data-*`), or a function of the thumb's index for a range slider. They win
   * over the `aria-label`, `aria-labelledby` and `aria-describedby` the root
   * passes on. The spoken value comes from `format` on the root.
   */
  thumbProps?: ((index: number) => SliderThumbProps) | SliderThumbProps;
  /** Classes merged into the track. */
  trackClassName?: string;
  value?: number[];
};

const THUMB_CLASS =
  "block size-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 data-[orientation=horizontal]:[transform:translateX(calc(50%_-_var(--slider-thumb-position)))] data-[orientation=vertical]:[transform:translateY(calc(var(--slider-thumb-position)_-_50%))]";
const TRACK_CLASS =
  "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary";

const thumbPropsAt = (
  thumbProps: SliderProps["thumbProps"],
  index: number,
): SliderThumbProps | undefined =>
  typeof thumbProps === "function" ? thumbProps(index) : thumbProps;

/** ui-sdk reports a lone value as a number; the Radix API is always a list. */
const toList = (value: number | number[]) =>
  Array.isArray(value) ? value : [value];

/**
 * Range input with one thumb per value. `aria-label`, `aria-labelledby` and
 * `aria-describedby` name each focusable thumb (`role="slider"`), not the
 * non-interactive root.
 */
const Slider = ({
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  controlClassName,
  defaultValue,
  dir,
  inverted,
  min = 0,
  onValueChange,
  onValueCommit,
  rangeClassName,
  ref,
  thumbClassName,
  thumbProps,
  trackClassName,
  value,
  ...props
}: SliderProps) => {
  const values = value ?? defaultValue ?? [min];
  const direction = inverted ? (dir === "rtl" ? "ltr" : "rtl") : dir;

  return (
    <SliderPrimitive
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      defaultValue={value === undefined ? values : undefined}
      dir={direction}
      min={min}
      onValueChange={(next) => {
        onValueChange?.(toList(next));
      }}
      onValueCommit={(next) => {
        onValueCommit?.(toList(next));
      }}
      ref={ref}
      value={value}
      {...props}
    >
      <SliderControl
        className={cn("relative flex w-full items-center", controlClassName)}
      >
        <SliderTrack className={cn(TRACK_CLASS, trackClassName)}>
          <SliderIndicator
            className={cn("absolute h-full bg-primary", rangeClassName)}
          />
        </SliderTrack>
        {values.map((_, index) => (
          <SliderThumb
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            className={cn(THUMB_CLASS, thumbClassName)}
            {...thumbPropsAt(thumbProps, index)}
            index={index}
            key={index}
          />
        ))}
      </SliderControl>
    </SliderPrimitive>
  );
};
Slider.displayName = "Slider";

export { Slider };
