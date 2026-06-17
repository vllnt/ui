"use client";

import * as React from "react";

import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@vllnt/ui";
import { Button } from "@vllnt/ui";
import { Calendar } from "@vllnt/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@vllnt/ui";

const rangeFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatRange(range: DateRange | undefined): string | undefined {
  if (!range?.from) {
    return undefined;
  }

  if (!range.to) {
    return rangeFormatter.format(range.from);
  }

  return `${rangeFormatter.format(range.from)} – ${rangeFormatter.format(range.to)}`;
}

/** Popover date-range picker built on the range calendar. */
export type DateRangePickerProps = {
  buttonClassName?: string;
  className?: string;
  defaultValue?: DateRange;
  numberOfMonths?: number;
  onValueChange?: (range?: DateRange) => void;
  placeholder?: string;
  value?: DateRange;
};

const DateRangePicker = ({
  buttonClassName,
  className,
  defaultValue,
  numberOfMonths = 2,
  onValueChange,
  placeholder = "Pick a date range",
  ref,
  value,
}: DateRangePickerProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const [internalValue, setInternalValue] = React.useState<
    DateRange | undefined
  >(defaultValue);
  const selected = value ?? internalValue;
  const label = formatRange(selected);

  const handleSelect = (range: DateRange | undefined) => {
    if (value === undefined) {
      setInternalValue(range);
    }

    onValueChange?.(range);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full justify-start text-left font-normal",
            !label && "text-muted-foreground",
            buttonClassName,
          )}
          ref={ref}
          variant="outline"
        >
          <CalendarIcon className="mr-2 size-4" />
          {label ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-auto p-0", className)}>
        <Calendar
          mode="range"
          numberOfMonths={numberOfMonths}
          onSelect={handleSelect}
          selected={selected}
        />
      </PopoverContent>
    </Popover>
  );
};
DateRangePicker.displayName = "DateRangePicker";

export { DateRangePicker };
