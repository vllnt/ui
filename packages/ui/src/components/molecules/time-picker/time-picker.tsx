"use client";

import * as React from "react";

import { Clock } from "lucide-react";

import { moveRovingFocus } from "../../../lib/roving-focus";
import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../atoms/popover/popover";

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
  ref?: React.Ref<HTMLDivElement>;
  selected: string;
};

/**
 * WAI-ARIA APG listbox with a roving tabindex: the selected option (or the
 * first) is the column's single tab stop; ArrowUp / ArrowDown, Home / End and
 * PageUp / PageDown move focus and select.
 */
function TimeColumn({
  label,
  onSelect,
  options,
  ref,
  selected,
}: TimeColumnProps) {
  const tabStop = options.includes(selected) ? selected : options[0];
  return (
    <div
      aria-label={label}
      className="flex max-h-56 flex-col gap-1 overflow-y-auto px-1"
      onKeyDown={(event) => {
        moveRovingFocus(event, '[role="option"]', {
          activate: true,
          loop: false,
          orientation: "vertical",
          pageStep: 5,
        });
      }}
      ref={ref}
      role="listbox"
      tabIndex={-1}
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
          tabIndex={option === tabStop ? 0 : -1}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function focusTabStop(column: HTMLDivElement | null, event: Event): void {
  const stop = column?.querySelector<HTMLElement>('[tabindex="0"]');
  if (!stop) return;
  event.preventDefault();
  stop.focus();
}

/** Popover-based time selector built from hour and minute columns. */
export type TimePickerProps = {
  className?: string;
  defaultValue?: string;
  minuteStep?: number;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Accessible name of the popover dialog. Defaults to "Choose time". */
  popoverLabel?: string;
  value?: string;
};

const TimePicker = ({
  className,
  defaultValue = "",
  minuteStep = 5,
  onValueChange,
  placeholder = "Select time",
  popoverLabel = "Choose time",
  ref,
  value,
}: TimePickerProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value ?? internalValue;
  const hourColumnRef = React.useRef<HTMLDivElement>(null);
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
          <Clock aria-hidden="true" className="mr-2 size-4" />
          {currentValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={popoverLabel}
        className="w-auto p-2"
        onOpenAutoFocus={(event) => {
          focusTabStop(hourColumnRef.current, event);
        }}
      >
        <div className="flex gap-2">
          <TimeColumn
            label="Hour"
            onSelect={(nextHour) => {
              commit(nextHour, minute);
            }}
            options={buildOptions(24, 1)}
            ref={hourColumnRef}
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
