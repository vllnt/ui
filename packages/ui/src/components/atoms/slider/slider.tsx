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

type SliderProps = Omit<
  React.ComponentProps<typeof SliderPrimitive>,
  "controller" | "defaultValue" | "onValueChange" | "onValueCommit" | "value"
> & {
  defaultValue?: number[];
  /** Runs the way `dir="rtl"` does: the slider reads from the end side. Works on a horizontal slider. */
  inverted?: boolean;
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  ref?: React.Ref<HTMLDivElement>;
  value?: number[];
};

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
  defaultValue,
  dir,
  inverted,
  min = 0,
  onValueChange,
  onValueCommit,
  ref,
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
      <SliderControl className="relative flex w-full items-center">
        <SliderTrack className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary forced-colors:border forced-colors:border-[color:ButtonText]">
          <SliderIndicator className="absolute h-full bg-primary forced-colors:bg-[color:Highlight]" />
        </SliderTrack>
        {values.map((_, index) => (
          <SliderThumb
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            className="block size-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 data-[orientation=horizontal]:[transform:translateX(calc(50%_-_var(--slider-thumb-position)))] data-[orientation=vertical]:[transform:translateY(calc(var(--slider-thumb-position)_-_50%))] forced-colors:border-[color:ButtonText] forced-colors:bg-[color:ButtonFace]"
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
