"use client";

import * as React from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { useControllableState } from "../../lib/use-controllable-state";
import { cn } from "../../lib/utils";
import { Button } from "../button/button";
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
  listboxId,
  onSelect,
  options,
  resolvedValue,
  searchPlaceholder,
}: {
  className?: string;
  commandClassName?: string;
  emptyText: string;
  listboxId: string;
  onSelect: (value: string) => void;
  options: ComboboxOption[];
  resolvedValue: string;
  searchPlaceholder: string;
}) {
  return (
    <PopoverContent
      className={cn("w-[var(--radix-popover-trigger-width)] p-0", className)}
    >
      <Command className={commandClassName}>
        <CommandInput placeholder={searchPlaceholder} />
        <CommandList id={listboxId}>
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
    const listboxId = React.useId();
    const [resolvedValue, setResolvedValue] = useControllableState({
      defaultValue: value ?? "",
      onChange: onValueChange,
      value,
    });
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
            aria-controls={listboxId}
            aria-expanded={open}
            aria-haspopup="listbox"
            className={cn("w-full justify-between", triggerClassName)}
            ref={reference}
            role="combobox"
            variant="outline"
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <ComboboxListPanel
          className={className}
          commandClassName={commandClassName}
          emptyText={emptyText}
          listboxId={listboxId}
          onSelect={handleSelect}
          options={options}
          resolvedValue={resolvedValue}
          searchPlaceholder={searchPlaceholder}
        />
      </Popover>
    );
  },
);
Combobox.displayName = "Combobox";

export { Combobox };
