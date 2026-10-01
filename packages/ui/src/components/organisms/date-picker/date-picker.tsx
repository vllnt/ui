"use client";

import * as React from "react";

import { CalendarIcon } from "lucide-react";

import { focusCalendarDay } from "../../../lib/focus-calendar-day";
import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../atoms/popover/popover";
import {
  Calendar,
  type CalendarProps,
} from "../../molecules/calendar/calendar";

const defaultDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export type DatePickerProps = {
  buttonClassName?: string;
  calendarProps?: Omit<CalendarProps, "mode" | "onSelect" | "selected">;
  className?: string;
  onValueChange?: (date?: Date) => void;
  placeholder?: string;
  /** Accessible name of the calendar popover dialog. Defaults to "Choose date". */
  popoverLabel?: string;
  value?: Date;
};

const DatePicker = ({
  buttonClassName,
  calendarProps,
  className,
  onValueChange,
  placeholder = "Pick a date",
  popoverLabel = "Choose date",
  ref: reference,
  value,
}: DatePickerProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<Date | undefined>(
    () => value,
  );
  const selectedDate = value ?? internalValue;

  const handleSelect = (nextDate: Date | undefined) => {
    if (value === undefined) {
      setInternalValue(nextDate);
    }

    onValueChange?.(nextDate);

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
            ? defaultDateFormatter.format(selectedDate)
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={popoverLabel}
        className={cn("w-auto p-0", className)}
        onOpenAutoFocus={focusCalendarDay}
      >
        <Calendar
          defaultMonth={selectedDate}
          mode="single"
          onSelect={handleSelect}
          selected={selectedDate}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
};
DatePicker.displayName = "DatePicker";

export { DatePicker };
