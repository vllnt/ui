"use client";

import { useState } from "react";

import type { DateRange } from "react-day-picker";

import { Calendar } from "../calendar";

/** Calendar that selects a start and end date as a range. */
export type RangeCalendarProps = {
  className?: string;
  defaultValue?: DateRange;
  numberOfMonths?: number;
  onValueChange?: (range?: DateRange) => void;
  value?: DateRange;
};

function RangeCalendar({
  className,
  defaultValue,
  numberOfMonths = 2,
  onValueChange,
  value,
}: RangeCalendarProps) {
  const [internalValue, setInternalValue] = useState<DateRange | undefined>(
    defaultValue,
  );
  const selected = value ?? internalValue;

  const handleSelect = (range: DateRange | undefined) => {
    if (value === undefined) {
      setInternalValue(range);
    }

    onValueChange?.(range);
  };

  return (
    <Calendar
      className={className}
      mode="range"
      numberOfMonths={numberOfMonths}
      onSelect={handleSelect}
      selected={selected}
    />
  );
}

export { RangeCalendar };
