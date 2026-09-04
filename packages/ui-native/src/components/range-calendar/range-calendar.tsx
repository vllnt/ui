"use client";

import type { Ref } from "react";
import type { View, ViewProps } from "react-native";

import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { Calendar, type CalendarLabels } from "../calendar/calendar";

/** Native date-range value with an optional in-progress end date. */
export type DateRange = { readonly end?: Date; readonly start: Date };
/** Props for a native range-selection calendar. */
export type RangeCalendarProps = Omit<ViewProps, "children"> & {
  readonly disabled?: boolean;
  readonly isDateDisabled?: (date: Date) => boolean;
  readonly labels: CalendarLabels;
  readonly month?: Date;
  readonly onMonthChange?: (month: Date) => void;
  readonly range: ControllableStateOptions<DateRange | undefined>;
  readonly ref?: Ref<View>;
};

/** Native calendar that chooses an ordered start/end Date range. */
function RangeCalendar({
  range: rangeState,
  ref,
  ...props
}: RangeCalendarProps) {
  const [range, setRange] = useControllableState(rangeState);
  const choose = (date?: Date) => {
    if (!date) return;
    if (!range || range.end) {
      setRange({ start: date });
      return;
    }
    if (date.getTime() < range.start.getTime())
      setRange({ end: range.start, start: date });
    else setRange({ end: date, start: range.start });
  };
  return (
    <Calendar
      {...props}
      ref={ref}
      selection={{
        mode: "controlled",
        onChange: choose,
        value: range?.end ?? range?.start,
      }}
    />
  );
}
RangeCalendar.displayName = "RangeCalendar";

export { RangeCalendar };
