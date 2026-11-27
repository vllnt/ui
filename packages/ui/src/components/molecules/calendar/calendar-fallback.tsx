"use client";

import { firstDayOfWeek } from "@ui-sdk/core/date";

import { named } from "../../../lib/named";

import { calendarLayout } from "./calendar-layout";

export type CalendarFallbackProps = {
  fixedWeeks?: boolean;
  locale?: string;
  /** The first month the calendar will show. Defaults to this month. */
  month?: Date;
  numberOfMonths?: number;
  weekStartsOn?: number;
};

const DAYS_IN_WEEK = [0, 1, 2, 3, 4, 5, 6];

/** The page language, or US English where there is no document to ask. */
function pageLocale() {
  return typeof document === "undefined"
    ? "en-US"
    : document.documentElement.lang || "en-US";
}

/** The number of week rows a month takes, like the calendar's grid for it. */
function weekCount(month: Date, weekStartsOn: number) {
  const year = month.getFullYear();
  const leadingDays =
    (new Date(year, month.getMonth(), 1).getDay() - weekStartsOn + 7) % 7;
  const days = new Date(year, month.getMonth() + 1, 0).getDate();
  return Math.ceil((leadingDays + days) / 7);
}

/**
 * Blank space the size of a Calendar, so whatever holds it keeps its size
 * while the calendar loads. It uses the calendar's own layout classes and
 * the number of weeks each month will have.
 */
const CalendarFallback = /* @__PURE__ */ named(
  "CalendarFallback",
  function CalendarFallback({
    fixedWeeks,
    locale = pageLocale(),
    month = new Date(),
    numberOfMonths = 1,
    weekStartsOn = firstDayOfWeek(locale),
  }: CalendarFallbackProps) {
    const months = Math.max(1, Math.floor(numberOfMonths) || 1);

    return (
      <div aria-hidden="true" className={calendarLayout.root}>
        <div className={calendarLayout.months}>
          <nav className={calendarLayout.nav} />
          {Array.from({ length: months }, (_, offset) => {
            const weeks = fixedWeeks
              ? 6
              : weekCount(
                  new Date(month.getFullYear(), month.getMonth() + offset, 1),
                  weekStartsOn,
                );

            return (
              <div className={calendarLayout.month} key={offset}>
                <div className={calendarLayout.caption}>
                  <span className={calendarLayout.captionLabel}>&nbsp;</span>
                </div>
                <table className={calendarLayout.table}>
                  <thead className={calendarLayout.weekdays}>
                    <tr>
                      {DAYS_IN_WEEK.map((day) => (
                        <th className={calendarLayout.weekday} key={day}>
                          &nbsp;
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: weeks }, (_week, row) => (
                      <tr className={calendarLayout.week} key={row}>
                        {DAYS_IN_WEEK.map((day) => (
                          <td className={calendarLayout.cell} key={day} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

export { CalendarFallback };
