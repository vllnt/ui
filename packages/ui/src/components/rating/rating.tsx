"use client";

import { useMemo, useState } from "react";

import { Star } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

const sizeClasses = {
  lg: "h-6 w-6",
  md: "h-5 w-5",
  sm: "h-4 w-4",
};

export type RatingProps = {
  allowClear?: boolean;
  className?: string;
  defaultValue?: number;
  label?: string;
  max?: number;
  onValueChange?: (value: number) => void;
  readOnly?: boolean;
  showValue?: boolean;
  size?: keyof typeof sizeClasses;
  value?: number;
};

type RatingStarsProps = {
  activeValue: number;
  hoveredValue: number;
  label: string;
  max: number;
  onHoverChange: (value: number) => void;
  onSelect: (value: number) => void;
  readOnly: boolean;
  size: keyof typeof sizeClasses;
};

function RatingStars({
  activeValue,
  hoveredValue,
  label,
  max,
  onHoverChange,
  onSelect,
  readOnly,
  size,
}: RatingStarsProps): ReactNode {
  const stars = useMemo(
    () => Array.from({ length: max }, (_, index) => index + 1),
    [max],
  );
  const displayValue = hoveredValue || activeValue;

  return (
    <div
      aria-label={label}
      className="inline-flex items-center gap-1"
      role="radiogroup"
    >
      {stars.map((starValue) => {
        const isFilled = starValue <= displayValue;

        return (
          <button
            aria-checked={activeValue === starValue}
            aria-label={`${starValue} ${starValue === 1 ? "star" : "stars"}`}
            className={cn(
              "rounded-sm text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              !readOnly && "hover:text-amber-500",
              isFilled && "text-amber-500",
            )}
            disabled={readOnly}
            key={starValue}
            onBlur={() => {
              onHoverChange(0);
            }}
            onClick={() => {
              onSelect(starValue);
            }}
            onMouseEnter={() => {
              if (!readOnly) {
                onHoverChange(starValue);
              }
            }}
            onMouseLeave={() => {
              onHoverChange(0);
            }}
            role="radio"
            type="button"
          >
            <Star
              className={cn(sizeClasses[size], isFilled && "fill-current")}
              strokeWidth={1.75}
            />
          </button>
        );
      })}
    </div>
  );
}

export function Rating({
  allowClear = false,
  className,
  defaultValue = 0,
  label = "Rating",
  max = 5,
  onValueChange,
  readOnly = false,
  showValue = false,
  size = "md",
  value,
}: RatingProps): ReactNode {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [hoveredValue, setHoveredValue] = useState(0);
  const activeValue = isControlled ? (value ?? 0) : internalValue;

  const handleSelect = (nextValue: number): void => {
    const resolvedValue =
      allowClear && activeValue === nextValue ? 0 : nextValue;

    if (!isControlled) {
      setInternalValue(resolvedValue);
    }

    onValueChange?.(resolvedValue);
  };

  return (
    <div className={cn("inline-flex flex-col gap-2", className)}>
      <div className="inline-flex items-center gap-3">
        <RatingStars
          activeValue={activeValue}
          hoveredValue={hoveredValue}
          label={label}
          max={max}
          onHoverChange={setHoveredValue}
          onSelect={handleSelect}
          readOnly={readOnly}
          size={size}
        />
        {showValue ? (
          <span className="text-sm text-muted-foreground">
            {activeValue}/{max}
          </span>
        ) : null}
      </div>
    </div>
  );
}
