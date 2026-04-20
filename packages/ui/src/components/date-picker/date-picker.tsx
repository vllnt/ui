"use client";

import * as React from "react";

import { CalendarIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Calendar, type CalendarProps } from "../calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

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
  value?: Date;
};

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      buttonClassName,
      calendarProps,
      className,
      onValueChange,
      placeholder = "Pick a date",
      value,
    },
    reference,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<Date | undefined>(
      value,
    );
    const selectedDate = value ?? internalValue;

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

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
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate
              ? defaultDateFormatter.format(selectedDate)
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className={cn("w-auto p-0", className)}>
          <Calendar
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
DatePicker.displayName = "DatePicker";

export { DatePicker };
