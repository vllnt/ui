"use client";

import { useId } from "react";

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
  /**
   * Accessible name of each thumb, by index. A label replaces the whole name
   * of its thumb, `aria-label` and `aria-labelledby` included. Without labels,
   * the thumbs of a two-thumb range add a lower and an upper suffix to the
   * slider's name, so a screen reader can tell them apart.
   */
  thumbLabels?: string[];
  value?: number[];
};

/** ui-sdk reports a lone value as a number; the Radix API is always a list. */
const toList = (value: number | number[]) =>
  Array.isArray(value) ? value : [value];

/** Tells the two thumbs of a range apart. */
const RANGE_SUFFIXES = ["Minimum", "Maximum"];

/**
 * Names a thumb. Its own label wins; a two-thumb range adds its suffix to the
 * slider's name, through a hidden span when that name comes from
 * `aria-labelledby`.
 */
function getThumbName({
  ariaLabel,
  ariaLabelledBy,
  label,
  suffix,
  suffixId,
}: {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  label?: string;
  suffix?: string;
  suffixId: string;
}) {
  if (label !== undefined) {
    return { "aria-label": label };
  }
  if (suffix === undefined) {
    return { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy };
  }
  if (ariaLabelledBy !== undefined) {
    return { "aria-labelledby": `${ariaLabelledBy} ${suffixId}` };
  }
  return { "aria-label": ariaLabel ? `${ariaLabel} ${suffix}` : suffix };
}

type ThumbProps = {
  ariaDescribedBy?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  baseId: string;
  count: number;
  index: number;
  label?: string;
};

function Thumb({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  baseId,
  count,
  index,
  label,
}: ThumbProps) {
  const suffix = count === 2 ? RANGE_SUFFIXES[index] : undefined;
  const suffixId = `${baseId}-thumb-${index}`;

  return (
    <SliderThumb
      aria-describedby={ariaDescribedBy}
      {...getThumbName({ ariaLabel, ariaLabelledBy, label, suffix, suffixId })}
      className={cn(
        "block size-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 data-[orientation=horizontal]:[transform:translateX(calc(50%_-_var(--slider-thumb-position)))] data-[orientation=vertical]:[transform:translateY(calc(var(--slider-thumb-position)_-_50%))] forced-colors:border-[color:ButtonText] forced-colors:bg-[color:ButtonFace]",
      )}
      index={index}
    >
      {label === undefined &&
      ariaLabelledBy !== undefined &&
      suffix !== undefined ? (
        <span className="sr-only" id={suffixId}>
          {suffix}
        </span>
      ) : null}
    </SliderThumb>
  );
}

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
  thumbLabels,
  value,
  ...props
}: SliderProps) => {
  const baseId = useId();
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
          <Thumb
            ariaDescribedBy={ariaDescribedBy}
            ariaLabel={ariaLabel}
            ariaLabelledBy={ariaLabelledBy}
            baseId={baseId}
            count={values.length}
            index={index}
            key={index}
            label={thumbLabels?.[index]}
          />
        ))}
      </SliderControl>
    </SliderPrimitive>
  );
};
Slider.displayName = "Slider";

export { Slider };
