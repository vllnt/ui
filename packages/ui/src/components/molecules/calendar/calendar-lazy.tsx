"use client";

import * as React from "react";

import { named } from "../../../lib/named";

import type { CalendarProps } from "./calendar";
import { CalendarFallback } from "./calendar-fallback";

const LoadedCalendar = React.lazy(() =>
  import("./calendar").then((module_) => ({ default: module_.Calendar })),
);

/**
 * A Calendar that loads on demand, for the places that show it after a press,
 * like a popover. Until it arrives, blank space of the same size holds its
 * place, so what holds it doesn't jump.
 */
const LazyCalendar = /* @__PURE__ */ named(
  "LazyCalendar",
  function LazyCalendar(props: CalendarProps) {
    const {
      defaultMonth,
      fixedWeeks,
      locale,
      month,
      numberOfMonths,
      weekStartsOn,
    } = props;

    return (
      <React.Suspense
        fallback={
          <CalendarFallback
            fixedWeeks={fixedWeeks}
            locale={locale}
            month={month ?? defaultMonth}
            numberOfMonths={numberOfMonths}
            weekStartsOn={weekStartsOn}
          />
        }
      >
        <LoadedCalendar {...props} />
      </React.Suspense>
    );
  },
);

export { LazyCalendar };
