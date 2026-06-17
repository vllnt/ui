"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

const presetSwatches: string[] = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#64748b",
  "#0f172a",
];

function hexPart(value: number): string {
  return value.toString(16).padStart(2, "0");
}

function toHex(red: number, green: number, blue: number): string {
  return `#${hexPart(red)}${hexPart(green)}${hexPart(blue)}`;
}

function hueChannel(hue: number, offset: number): number {
  const k = (offset + hue / 30) % 12;
  const amount = 0.45;
  const value = 0.5 - amount * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  return Math.round(value * 255);
}

function hueToHex(hue: number): string {
  return toHex(hueChannel(hue, 0), hueChannel(hue, 8), hueChannel(hue, 4));
}

type SwatchGridProps = {
  onSelect: (value: string) => void;
  selected: string;
  swatches: string[];
};

function SwatchGrid({ onSelect, selected, swatches }: SwatchGridProps) {
  return (
    <div className="grid grid-cols-6 gap-2" role="group">
      {swatches.map((swatch) => (
        <button
          aria-label={swatch}
          aria-pressed={swatch.toLowerCase() === selected.toLowerCase()}
          className={cn(
            "size-7 rounded-md border outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            swatch.toLowerCase() === selected.toLowerCase() &&
              "ring-2 ring-ring",
          )}
          key={swatch}
          onClick={() => {
            onSelect(swatch);
          }}
          style={{ backgroundColor: swatch }}
          type="button"
        />
      ))}
    </div>
  );
}

/** Popover colour picker with swatches, a hue slider, and a hex input. */
export type ColorPickerProps = {
  className?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  swatches?: string[];
  value?: string;
};

const ColorPicker = React.forwardRef<HTMLButtonElement, ColorPickerProps>(
  (
    {
      className,
      defaultValue = "#3b82f6",
      onValueChange,
      swatches = presetSwatches,
      value,
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = value ?? internalValue;

    const update = (next: string) => {
      if (value === undefined) {
        setInternalValue(next);
      }

      onValueChange?.(next);
    };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn("w-full justify-start gap-2 font-normal", className)}
            ref={ref}
            variant="outline"
          >
            <span
              aria-hidden
              className="size-4 rounded-sm border"
              style={{ backgroundColor: currentValue }}
            />
            <span className="uppercase tabular-nums">{currentValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 space-y-3">
          <SwatchGrid
            onSelect={update}
            selected={currentValue}
            swatches={swatches}
          />
          <input
            aria-label="Hue"
            className="h-3 w-full cursor-pointer appearance-none rounded-full"
            max={360}
            min={0}
            onChange={(event) => {
              update(hueToHex(Number(event.target.value)));
            }}
            style={{
              background:
                "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
            }}
            type="range"
          />
          <Input
            aria-label="Hex value"
            onChange={(event) => {
              update(event.target.value);
            }}
            value={currentValue}
          />
        </PopoverContent>
      </Popover>
    );
  },
);
ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
