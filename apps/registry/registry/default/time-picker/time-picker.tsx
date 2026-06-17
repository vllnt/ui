"use client";

import * as React from "react";

import { Clock } from "lucide-react";

import { cn } from "@vllnt/ui";
import { Button } from "@vllnt/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@vllnt/ui";

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function buildOptions(count: number, step: number): string[] {
  return Array.from({ length: Math.ceil(count / step) }, (_unused, index) =>
    pad(index * step),
  );
}

function splitTime(value: string) {
  const [hour = "", minute = ""] = value.split(":");
  return { hour, minute };
}

type TimeColumnProps = {
  label: string;
  onSelect: (value: string) => void;
  options: string[];
  selected: string;
};

function TimeColumn({ label, onSelect, options, selected }: TimeColumnProps) {
  return (
    <div
      aria-label={label}
      className="flex max-h-56 flex-col gap-1 overflow-y-auto px-1"
      role="listbox"
    >
      {options.map((option) => (
        <button
          aria-selected={option === selected}
          className={cn(
            "rounded-sm px-3 py-1.5 text-sm tabular-nums outline-none transition-colors hover:bg-accent focus-visible:bg-accent",
            option === selected &&
              "bg-primary text-primary-foreground hover:bg-primary",
          )}
          key={option}
          onClick={() => {
            onSelect(option);
          }}
          role="option"
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/** Popover-based time selector built from hour and minute columns. */
export type TimePickerProps = {
  className?: string;
  defaultValue?: string;
  minuteStep?: number;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
};

const TimePicker = ({
  className,
  defaultValue = "",
  minuteStep = 5,
  onValueChange,
  placeholder = "Select time",
  ref,
  value,
}: TimePickerProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value ?? internalValue;
  const { hour, minute } = splitTime(currentValue);

  const commit = (nextHour: string, nextMinute: string) => {
    const next = `${nextHour || "00"}:${nextMinute || "00"}`;
    if (value === undefined) {
      setInternalValue(next);
    }

    onValueChange?.(next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full justify-start text-left font-normal",
            !currentValue && "text-muted-foreground",
            className,
          )}
          ref={ref}
          variant="outline"
        >
          <Clock className="mr-2 size-4" />
          {currentValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2">
        <div className="flex gap-2">
          <TimeColumn
            label="Hour"
            onSelect={(nextHour) => {
              commit(nextHour, minute);
            }}
            options={buildOptions(24, 1)}
            selected={hour}
          />
          <TimeColumn
            label="Minute"
            onSelect={(nextMinute) => {
              commit(hour, nextMinute);
            }}
            options={buildOptions(60, minuteStep)}
            selected={minute}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
TimePicker.displayName = "TimePicker";

export { TimePicker };
