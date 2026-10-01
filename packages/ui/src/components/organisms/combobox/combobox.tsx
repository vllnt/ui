"use client";

import * as React from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../atoms/popover/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../molecules/command/command";

export type ComboboxOption = {
  disabled?: boolean;
  keywords?: string[];
  label: string;
  value: string;
};

export type ComboboxProps = {
  /** Accessible name for the trigger when no `<label>` points at `id`. */
  "aria-describedby"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  commandClassName?: string;
  emptyText?: string;
  /** Id for the trigger button, e.g. for `<label htmlFor>`. */
  id?: string;
  onValueChange?: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  /**
   * Accessible name of the popover dialog. Defaults to `aria-label`, then
   * `placeholder`.
   */
  popoverLabel?: string;
  searchPlaceholder?: string;
  triggerClassName?: string;
  value?: string;
};

function useComboboxValue(
  value: string | undefined,
  onValueChange?: (value: string) => void,
) {
  const [internalValue, setInternalValue] = React.useState(value ?? "");

  const resolvedValue = value ?? internalValue;

  const setResolvedValue = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  return { resolvedValue, setResolvedValue };
}

function ComboboxOptionItem({
  onSelect,
  option,
  selectedValue,
}: {
  onSelect: (value: string) => void;
  option: ComboboxOption;
  selectedValue: string;
}) {
  const keywords = option.keywords?.join(" ") ?? "";

  return (
    <CommandItem
      disabled={option.disabled}
      onSelect={() => {
        onSelect(option.value);
      }}
      value={`${option.label} ${option.value} ${keywords}`}
    >
      <Check
        className={cn(
          "mr-2 size-4",
          selectedValue === option.value ? "opacity-100" : "opacity-0",
        )}
      />
      <span className="truncate">{option.label}</span>
    </CommandItem>
  );
}

function ComboboxListPanel({
  className,
  commandClassName,
  emptyText,
  label,
  onSelect,
  options,
  resolvedValue,
  searchPlaceholder,
}: {
  className?: string;
  commandClassName?: string;
  emptyText: string;
  label: string;
  onSelect: (value: string) => void;
  options: ComboboxOption[];
  resolvedValue: string;
  searchPlaceholder: string;
}) {
  return (
    <PopoverContent
      aria-label={label}
      className={cn("w-[var(--radix-popover-trigger-width)] p-0", className)}
    >
      <Command className={commandClassName}>
        <CommandInput placeholder={searchPlaceholder} />
        <CommandList>
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <ComboboxOptionItem
                key={option.value}
                onSelect={onSelect}
                option={option}
                selectedValue={resolvedValue}
              />
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  );
}

const Combobox = ({
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  commandClassName,
  emptyText = "No option found.",
  id,
  onValueChange,
  options,
  placeholder = "Select an option",
  popoverLabel,
  ref: reference,
  searchPlaceholder = "Search options...",
  triggerClassName,
  value,
}: ComboboxProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const [open, setOpen] = React.useState(false);
  const { resolvedValue, setResolvedValue } = useComboboxValue(
    value,
    onValueChange,
  );
  const selectedOption = options.find(
    (option) => option.value === resolvedValue,
  );

  const handleSelect = (nextValue: string) => {
    setResolvedValue(nextValue === resolvedValue ? "" : nextValue);
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-describedby={ariaDescribedBy}
          aria-expanded={open}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={cn("w-full justify-between", triggerClassName)}
          id={id}
          ref={reference}
          role="combobox"
          variant="outline"
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="ml-2 size-4 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <ComboboxListPanel
        className={className}
        commandClassName={commandClassName}
        emptyText={emptyText}
        label={popoverLabel ?? ariaLabel ?? placeholder}
        onSelect={handleSelect}
        options={options}
        resolvedValue={resolvedValue}
        searchPlaceholder={searchPlaceholder}
      />
    </Popover>
  );
};
Combobox.displayName = "Combobox";

export { Combobox };
