"use client";

import * as React from "react";

import { Clock } from "lucide-react";

import { cn } from "../../lib/utils";

/** Native time input styled to match the design system. */
export type TimeFieldProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "defaultValue" | "onChange" | "type" | "value"
> & {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

const TimeField = React.forwardRef<HTMLInputElement, TimeFieldProps>(
  ({ className, defaultValue = "", onValueChange, value, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = value ?? internalValue;

    return (
      <div className="relative w-full">
        <Clock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          {...props}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-calendar-picker-indicator]:opacity-60",
            className,
          )}
          onChange={(event) => {
            if (value === undefined) {
              setInternalValue(event.target.value);
            }

            onValueChange?.(event.target.value);
          }}
          ref={ref}
          type="time"
          value={currentValue}
        />
      </div>
    );
  },
);
TimeField.displayName = "TimeField";

export { TimeField };
