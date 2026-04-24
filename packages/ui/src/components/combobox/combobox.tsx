"use client";

import * as React from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../command";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

export type ComboboxOption = {
  disabled?: boolean;
  keywords?: string[];
  label: string;
  value: string;
};

export type ComboboxProps = {
  className?: string;
  commandClassName?: string;
  emptyText?: string;
  onValueChange?: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  triggerClassName?: string;
  value?: string;
};

function useComboboxValue(
  value: string | undefined,
  onValueChange?: (value: string) => void,
) {
  const [internalValue, setInternalValue] = React.useState(value ?? "");

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

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
          "mr-2 h-4 w-4",
          selectedValue === option.value ? "opacity-100" : "opacity-0",
        )}
      />
      <span className="truncate">{option.label}</span>
    </CommandItem>
  );
}

const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      className,
      commandClassName,
      emptyText = "No option found.",
      onValueChange,
      options,
      placeholder = "Select an option",
      searchPlaceholder = "Search options...",
      triggerClassName,
      value,
    },
    reference,
  ) => {
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
            aria-expanded={open}
            className={cn("w-full justify-between", triggerClassName)}
            ref={reference}
            role="combobox"
            variant="outline"
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "w-[var(--radix-popover-trigger-width)] p-0",
            className,
          )}
        >
          <Command className={commandClassName}>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <ComboboxOptionItem
                    key={option.value}
                    onSelect={handleSelect}
                    option={option}
                    selectedValue={resolvedValue}
                  />
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);
Combobox.displayName = "Combobox";

export { Combobox };
