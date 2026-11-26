"use client";

import * as React from "react";

import { CalendarIcon } from "lucide-react";

import { useControllableState } from "../../../lib/use-controllable-state";
import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../atoms/popover/popover";
import type { DateRange } from "../../molecules/calendar/calendar";
import { LazyCalendar } from "../../molecules/calendar/calendar-lazy";

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
  const [selected, handleSelect] = useControllableState<DateRange | undefined>({
    defaultValue,
    onChange: onValueChange,
    value,
  });
  const label = formatRange(selected);

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
      >
        <LazyCalendar
          defaultMonth={selected?.from}
          initialFocus
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
