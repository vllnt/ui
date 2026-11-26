/**
 * The classes that decide how big a Calendar is. `Calendar` and
 * `CalendarFallback` both build on them, so the placeholder shown while the
 * calendar loads is the same size as the calendar.
 */
export const calendarLayout = {
  caption: "flex justify-center pt-1 relative items-center",
  captionLabel: "text-sm font-medium",
  cell: "size-9",
  month: "space-y-4",
  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
  nav: "space-x-1 flex items-center",
  root: "p-3",
  table: "w-full border-collapse space-y-1",
  week: "flex w-full mt-2",
  weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
  // On the `thead`, whose `tr` the calendar renders.
  weekdays: "[&>tr]:flex",
} as const;
