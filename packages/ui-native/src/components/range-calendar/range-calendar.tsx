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

function startOfDay(date: Date): Date {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function normalizeRange(range?: DateRange): DateRange | undefined {
  if (!range || !Number.isFinite(range.start.getTime())) return undefined;
  const start = startOfDay(range.start);
  const end =
    range.end && Number.isFinite(range.end.getTime())
      ? startOfDay(range.end)
      : undefined;
  if (!end || start.getTime() <= end.getTime()) return { end, start };
  return { end: start, start: end };
}

/** Native calendar that chooses an ordered start/end Date range. */
function RangeCalendar({
  range: rangeState,
  ref,
  ...props
}: RangeCalendarProps) {
  const [rangeValue, setRange] = useControllableState(rangeState);
  const range = normalizeRange(rangeValue);
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
  const isDateSelected = (date: Date) => {
    if (!range) return false;
    const timestamp = date.getTime();
    const end = range.end?.getTime() ?? range.start.getTime();
    return timestamp >= range.start.getTime() && timestamp <= end;
  };
  return (
    <Calendar
      {...props}
      isDateSelected={isDateSelected}
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
