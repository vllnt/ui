"use client";

import { useControllableState } from "../../../lib/use-controllable-state";
import { Calendar, type DateRange } from "../../molecules/calendar/calendar";

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
  const [selected, handleSelect] = useControllableState<DateRange | undefined>({
    defaultValue,
    onChange: onValueChange,
    value,
  });

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
