"use client";

import * as React from "react";

import { CalendarDays } from "lucide-react";

import { cn } from "@vllnt/ui";

/** Native date input styled to match the design system. */
export type DateFieldProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "defaultValue" | "onChange" | "type" | "value"
> & {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

const DateField = ({
  className,
  defaultValue = "",
  onValueChange,
  ref,
  value,
  ...props
}: DateFieldProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value ?? internalValue;

  return (
    <div className="relative w-full">
      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
        type="date"
        value={currentValue}
      />
    </div>
  );
};
DateField.displayName = "DateField";

export { DateField };
