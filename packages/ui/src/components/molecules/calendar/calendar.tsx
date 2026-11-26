"use client";

import * as React from "react";

import {
  Calendar as CalendarRoot,
  type CalendarController,
  CalendarDay,
  type CalendarDayState,
  CalendarGrid,
  type CalendarGridCell,
  CalendarNext,
  type CalendarOptions,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  createCalendarController,
  type DateMatchers,
} from "@ui-sdk/react/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "../../../lib/utils";
import { buttonVariants } from "../../atoms/button/button";

import { calendarLayout } from "./calendar-layout";

/** A start and an end date. `to` stays unset while the range is open. */
export type DateRange = { from?: Date; to?: Date };

type DateMatch = ((date: Date) => boolean) | Date;

type Selection =
  | { mode: "multiple"; onSelect?: (dates?: Date[]) => void; selected?: Date[] }
  | {
      mode: "range";
      onSelect?: (range?: DateRange) => void;
      selected?: DateRange;
    }
  | { mode: "single"; onSelect?: (date?: Date) => void; selected?: Date }
  | { mode?: undefined; onSelect?: undefined; selected?: undefined };

export type CalendarProps = Omit<
  React.ComponentProps<"div">,
  "children" | "defaultValue" | "onSelect"
> &
  Selection & {
    /** The first month to show, when uncontrolled. Defaults to the selected date's month, else this month. */
    defaultMonth?: Date;
    /** Dates nobody can pick: a date, a list of dates, or a function that returns `true` for them. `true` disables the whole calendar. */
    disabled?: boolean | DateMatch | readonly DateMatch[];
    /** Show six weeks in every month, so the calendar keeps its height. */
    fixedWeeks?: boolean;
    /** The earliest date to pick. */
    fromDate?: Date;
    /** Focus the day that holds the tab stop (the selected day, else today) once the calendar shows. */
    initialFocus?: boolean;
    /** The language of the names and labels, like `"fr"`. Defaults to the page's language. */
    locale?: string;
    /** The first month to show. Pass it to control the calendar. */
    month?: Date;
    /** The number of months shown side by side. */
    numberOfMonths?: number;
    onMonthChange?: (month: Date) => void;
    /** Show the days of the months before and after at the edges. */
    showOutsideDays?: boolean;
    /** The latest date to pick. */
    toDate?: Date;
    /** The first day of the week, 0 for Sunday. Defaults to the locale's. */
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  };

const pad = (value: number, length = 2) => String(value).padStart(length, "0");

/** The calendar day of a local `Date`, as the `YYYY-MM-DD` the calendar works in. */
function toISODate(date?: Date): string | undefined {
  return date && !Number.isNaN(date.getTime())
    ? `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    : undefined;
}

function fromISODate(isoDate: string): Date {
  const [year = 0, month = 1, day = 1] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const toISOMonth = (date?: Date) => toISODate(date)?.slice(0, 7);

function toUnavailable(
  disabled: CalendarProps["disabled"],
): DateMatchers | undefined {
  if (disabled === undefined || typeof disabled === "boolean") {
    return undefined;
  }
  return [disabled].flat().flatMap((match) => {
    if (typeof match === "function") {
      return (isoDate: string) => match(fromISODate(isoDate));
    }
    return toISODate(match) ?? [];
  });
}

type SelectionOptions = Pick<
  CalendarOptions,
  "deselectable" | "mode" | "onAnchorChange" | "onValueChange" | "readOnly"
> & { value: null | string | string[] };

function singleOptions({
  onSelect,
  selected,
}: Extract<Selection, { mode: "single" }>): SelectionOptions {
  return {
    deselectable: true,
    mode: "single",
    onValueChange: (value) => {
      onSelect?.(typeof value === "string" ? fromISODate(value) : undefined);
    },
    value: toISODate(selected) ?? null,
  };
}

function multipleOptions({
  onSelect,
  selected = [],
}: Extract<Selection, { mode: "multiple" }>): SelectionOptions {
  return {
    mode: "multiple",
    onValueChange: (value) => {
      onSelect?.(
        Array.isArray(value) && value.length > 0
          ? value.map((isoDate) => fromISODate(isoDate))
          : undefined,
      );
    },
    value: selected.flatMap((date) => toISODate(date) ?? []),
  };
}

function rangeOptions({
  onSelect,
  selected,
}: Extract<Selection, { mode: "range" }>): SelectionOptions {
  const from = toISODate(selected?.from);
  const to = toISODate(selected?.to);
  return {
    mode: "range",
    // The calendar reports a range when both ends exist. The first press
    // reports an open range, as react-day-picker did.
    onAnchorChange: (anchor, details) => {
      if (anchor) {
        onSelect?.({ from: fromISODate(anchor) });
      } else if (details.reason === "escape-key") {
        onSelect?.();
      }
    },
    onValueChange: (value) => {
      onSelect?.(
        Array.isArray(value) && value.length === 2
          ? { from: fromISODate(value[0]), to: fromISODate(value[1]) }
          : undefined,
      );
    },
    value: from && to ? [from, to].sort() : null,
  };
}

/**
 * Translates `selected` and `onSelect` to the calendar's ISO dates. The
 * calendar shows the `selected` it gets and nothing else, as react-day-picker
 * did.
 */
function selectionOptions(selection: Selection): SelectionOptions {
  switch (selection.mode) {
    case "multiple":
      return multipleOptions(selection);
    case "range":
      return rangeOptions(selection);
    case "single":
      return singleOptions(selection);
    case undefined:
      return { mode: "single", readOnly: true, value: null };
  }
}

function dayCellClassName(day: CalendarDayState, interactive: boolean) {
  const middle = day.inRange && !day.rangeStart && !day.rangeEnd;
  let state = "bg-primary text-primary-foreground";
  if (day.outside) {
    state = "bg-accent/50 text-muted-foreground";
  } else if (middle) {
    state = "bg-accent text-accent-foreground";
  }

  return cn(
    "relative size-9 p-0 text-center text-sm focus-within:z-20",
    interactive && "group focus-visible:outline-none",
    interactive && !day.disabled && "cursor-pointer",
    day.today && "bg-accent text-accent-foreground",
    day.outside && "text-muted-foreground",
    day.selected && state,
    day.disabled && "text-muted-foreground opacity-50",
  );
}

/** The look of a day inside its cell. The cell keeps focus and this shows it. */
function dayButtonClassName(day: CalendarDayState) {
  return cn(
    buttonVariants({ variant: "ghost" }),
    "size-9 p-0 font-normal group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
    day.disabled && "pointer-events-none opacity-50",
  );
}

function DayContent({
  day,
  interactive,
}: {
  day: CalendarDayState;
  interactive: boolean;
}) {
  return interactive ? (
    <span className={dayButtonClassName(day)}>{day.label}</span>
  ) : (
    day.label
  );
}

type DayCellProperties = {
  cell: CalendarGridCell;
  idPrefix: string;
  interactive: boolean;
  showOutsideDays: boolean;
};

function DayCell({
  cell,
  idPrefix,
  interactive,
  showOutsideDays,
}: DayCellProperties) {
  if (cell.hidden && !showOutsideDays) {
    return <td className={calendarLayout.cell} />;
  }

  return (
    <CalendarDay
      className={(day) => dayCellClassName(day, interactive)}
      // A repeat of a day another month shows needs its own id, or the
      // calendar takes the two for one day.
      id={cell.hidden ? `${idPrefix}-${cell.date}` : undefined}
      // The name starts with the visible number, so it contains the visible
      // text (WCAG 2.5.3). Months side by side each show the days they share;
      // screen readers skip the repeats.
      render={(props, day) => (
        <td
          {...props}
          aria-hidden={cell.hidden || undefined}
          aria-label={`${day.label}, ${props["aria-label"]}`}
        />
      )}
      value={cell.date}
    >
      {(day) => <DayContent day={day} interactive={interactive} />}
    </CalendarDay>
  );
}

type CalendarMonthProperties = {
  interactive: boolean;
  offset: number;
  showOutsideDays: boolean;
};

/** One month: its caption above a table of weekday headers and weeks. */
function CalendarMonth({
  interactive,
  offset,
  showOutsideDays,
}: CalendarMonthProperties) {
  const idPrefix = React.useId();

  return (
    <CalendarGrid
      className={calendarLayout.table}
      offset={offset}
      render={(gridProps, grid) => (
        <div className={calendarLayout.month}>
          <div className={calendarLayout.caption}>
            <span
              aria-live="polite"
              className={calendarLayout.captionLabel}
              role="status"
            >
              {grid.label}
            </span>
          </div>
          <table {...gridProps} />
        </div>
      )}
    >
      {(grid) => (
        <>
          <CalendarWeekdays className={calendarLayout.weekdays}>
            {(index) => (
              <CalendarWeekday className={calendarLayout.weekday} index={index}>
                {(weekday) => weekday.label.slice(0, 2)}
              </CalendarWeekday>
            )}
          </CalendarWeekdays>
          <tbody>
            {grid.weeks.map((week) => (
              <tr
                className={calendarLayout.week}
                key={week[0]?.date}
                role="row"
              >
                {week.map((cell) => (
                  <DayCell
                    cell={cell}
                    idPrefix={idPrefix}
                    interactive={interactive}
                    key={cell.date}
                    showOutsideDays={showOutsideDays}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </>
      )}
    </CalendarGrid>
  );
}

const stepClassName = (side: "left" | "right") =>
  cn(
    buttonVariants({ variant: "outline" }),
    "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 aria-disabled:pointer-events-none absolute",
    side === "left" ? "left-1" : "right-1",
  );

function CalendarNavigation() {
  return (
    <nav aria-label="Navigation bar" className={calendarLayout.nav}>
      <CalendarPrevious
        aria-label="Go to the Previous Month"
        className={stepClassName("left")}
      >
        <ChevronLeft className="size-4" />
      </CalendarPrevious>
      <CalendarNext
        aria-label="Go to the Next Month"
        className={stepClassName("right")}
      >
        <ChevronRight className="size-4" />
      </CalendarNext>
    </nav>
  );
}

/** Focuses the calendar's tab stop once it shows. */
function useInitialFocus(controller: CalendarController, enabled?: boolean) {
  React.useEffect(() => {
    if (!enabled) {
      return;
    }
    // The calendar reads today on the client after it mounts, so wait a
    // frame for the tab stop to land on today.
    const frame = requestAnimationFrame(() => {
      controller.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [controller, enabled]);
}

/**
 * A month grid for picking dates, built on ui-sdk's calendar: one tab stop,
 * arrow keys move by day and week, Page Up and Page Down by month. It shows
 * the `selected` it gets. Without a `mode` it displays the month and picks
 * nothing.
 */
function Calendar({
  className,
  defaultMonth,
  disabled,
  fixedWeeks,
  fromDate,
  initialFocus,
  locale,
  mode,
  month,
  numberOfMonths = 1,
  onMonthChange,
  onSelect,
  selected,
  showOutsideDays = true,
  toDate,
  weekStartsOn,
  ...props
}: CalendarProps) {
  const [controller] = React.useState(createCalendarController);
  const months = Math.max(1, Math.floor(numberOfMonths) || 1);
  useInitialFocus(controller, initialFocus);

  const handleMonthChange = onMonthChange
    ? (value: string) => {
        onMonthChange(fromISODate(`${value}-01`));
      }
    : undefined;

  return (
    <CalendarRoot
      allowUnavailable
      className={cn(calendarLayout.root, className)}
      controller={controller}
      defaultMonth={toISOMonth(defaultMonth)}
      disabled={disabled === true}
      fixedWeeks={fixedWeeks}
      locale={locale}
      max={toISODate(toDate)}
      min={toISODate(fromDate)}
      month={toISOMonth(month)}
      months={months}
      onMonthChange={handleMonthChange}
      showOutsideDays={showOutsideDays}
      unavailable={toUnavailable(disabled)}
      weekStartsOn={weekStartsOn}
      {...selectionOptions({ mode, onSelect, selected } as Selection)}
      {...props}
    >
      <div className={calendarLayout.months}>
        <CalendarNavigation />
        {Array.from({ length: months }, (_, offset) => (
          <CalendarMonth
            interactive={mode !== undefined}
            key={offset}
            offset={offset}
            showOutsideDays={showOutsideDays}
          />
        ))}
      </div>
    </CalendarRoot>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
