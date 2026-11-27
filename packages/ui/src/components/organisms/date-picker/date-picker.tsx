"use client";

import * as React from "react";

import { CalendarIcon } from "lucide-react";

import { named } from "../../../lib/named";
import { useControllableState } from "../../../lib/use-controllable-state";
import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../atoms/popover/popover";
import type { CalendarProps } from "../../molecules/calendar/calendar";
import { LazyCalendar } from "../../molecules/calendar/calendar-lazy";

const defaultDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export type DatePickerProps = {
  buttonClassName?: string;
  calendarProps?: Omit<CalendarProps, "mode" | "onSelect" | "selected">;
  className?: string;
  /** The date shown at first. Ignored once `value` has a value. */
  defaultValue?: Date;
  onValueChange?: (date?: Date) => void;
  placeholder?: string;
  /** Accessible name of the calendar popover dialog. Defaults to "Choose date". */
  popoverLabel?: string;
  value?: Date;
};

const DatePicker = /* @__PURE__ */ named(
  "DatePicker",
  ({
    buttonClassName,
    calendarProps,
    className,
    defaultValue,
    onValueChange,
    placeholder = "Pick a date",
    popoverLabel = "Choose date",
    ref: reference,
    value,
  }: DatePickerProps & { ref?: React.Ref<HTMLButtonElement> }) => {
    const [open, setOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = useControllableState<
      Date | undefined
    >({ defaultValue, onChange: onValueChange, value });

    const handleSelect = (nextDate: Date | undefined) => {
      setSelectedDate(nextDate);

      if (nextDate) {
        setOpen(false);
      }
    };

    return (
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              buttonClassName,
            )}
            ref={reference}
            variant="outline"
          >
            <CalendarIcon aria-hidden="true" className="mr-2 size-4" />
            {selectedDate
              ? // react-doctor-disable-next-line react-doctor/no-locale-format-in-render -- the value is a calendar day built in this runtime (new Date(y, m, d)); the fixed en-US locale in the runtime's own time zone prints the same day on server and client, while a fixed UTC zone would shift it by a day east of UTC
                defaultDateFormatter.format(selectedDate)
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          aria-label={popoverLabel}
          className={cn("w-auto p-0", className)}
        >
          <LazyCalendar
            defaultMonth={selectedDate}
            initialFocus
            mode="single"
            onSelect={handleSelect}
            selected={selectedDate}
            {...calendarProps}
          />
        </PopoverContent>
      </Popover>
    );
  },
);

export { DatePicker };
