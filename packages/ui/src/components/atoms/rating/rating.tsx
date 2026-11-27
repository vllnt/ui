"use client";

import { Rating as RatingPrimitive, RatingItem } from "@ui-sdk/react/rating";
import { Star } from "lucide-react";
import type { ComponentPropsWithoutRef, KeyboardEvent, Ref } from "react";

import { HIT_AREA_24_RADIO_CHILD } from "../../../lib/hit-area";
import { named } from "../../../lib/named";
import { moveRovingFocus } from "../../../lib/roving-focus";
import { useControllableState } from "../../../lib/use-controllable-state";
import { cn } from "../../../lib/utils";

const sizeClasses = {
  lg: "size-6",
  md: "size-5",
  sm: "size-4",
};

export type RatingProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "defaultValue" | "onChange"
> & {
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

// ui-sdk moves between stars with the arrow keys; Home and End jump to the ends.
function handleEndKeys(event: KeyboardEvent<HTMLDivElement>): void {
  if (event.key !== "Home" && event.key !== "End") return;
  moveRovingFocus(event, '[role="radio"]', {
    activate: true,
    orientation: "both",
  });
}

/** Classes of one star: muted, amber once the shown score covers it. */
function getItemClassName(readOnly: boolean) {
  return ({ fill }: { fill: number }) =>
    cn(
      HIT_AREA_24_RADIO_CHILD,
      "inline-flex rounded-sm text-muted-foreground transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring [&>[role=radio]]:outline-none",
      !readOnly && "hover:text-amber-600 dark:hover:text-amber-500",
      fill === 1 && "text-amber-600 dark:text-amber-500",
    );
}

const Rating = /* @__PURE__ */ named(
  "Rating",
  ({
    allowClear = false,
    className,
    defaultValue = 0,
    label = "Rating",
    max = 5,
    onValueChange,
    readOnly = false,
    ref,
    showValue = false,
    size = "md",
    value,
    ...props
  }: RatingProps & { ref?: Ref<HTMLDivElement> }) => {
    const [activeValue, setActiveValue] = useControllableState({
      defaultValue,
      onChange: onValueChange,
      value,
    });

    return (
      <div
        {...props}
        className={cn("inline-flex flex-col gap-2", className)}
        ref={ref}
      >
        <div className="inline-flex items-center gap-3">
          <RatingPrimitive
            aria-label={label}
            className="inline-flex items-center gap-1"
            deselectable={allowClear}
            // ui-sdk swaps the radios of a locked score for one image. Disabling
            // them instead keeps their roles and labels.
            disabled={readOnly}
            loop
            max={max}
            onKeyDown={handleEndKeys}
            onValueChange={(next) => {
              setActiveValue(next ?? 0);
            }}
            tabIndex={-1}
            value={activeValue || null}
          >
            <RatingItem className={getItemClassName(readOnly)}>
              {({ fill }) => (
                <Star
                  className={cn(
                    sizeClasses[size],
                    fill === 1 && "fill-current",
                  )}
                  strokeWidth={1.75}
                />
              )}
            </RatingItem>
          </RatingPrimitive>
          {showValue ? (
            <span className="text-sm text-muted-foreground">
              {activeValue}/{max}
            </span>
          ) : null}
        </div>
      </div>
    );
  },
);

export { Rating };
