"use client";

import * as React from "react";

import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { focusCalendarDay } from "../../../lib/focus-calendar-day";
import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../atoms/popover/popover";
import { Calendar } from "../../molecules/calendar/calendar";

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
  /** Accessible name of the calendar popover dialog. Defaults to "Choose date range". */
  popoverLabel?: string;
  value?: DateRange;
};

const DateRangePicker = ({
  buttonClassName,
  className,
  defaultValue,
  numberOfMonths = 2,
  onValueChange,
  placeholder = "Pick a date range",
  popoverLabel = "Choose date range",
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
          <CalendarIcon aria-hidden="true" className="mr-2 size-4" />
          {label ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={popoverLabel}
        className={cn("w-auto p-0", className)}
        onOpenAutoFocus={focusCalendarDay}
      >
        <Calendar
          defaultMonth={selected?.from}
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
