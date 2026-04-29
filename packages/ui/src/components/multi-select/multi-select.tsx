"use client";

import * as React from "react";

import { Check, ChevronDown } from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";
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

export type MultiSelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export type MultiSelectProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "defaultValue" | "onChange" | "value"
> & {
  defaultValue?: string[];
  emptyText?: string;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  value?: string[];
};

type TriggerContentProps = {
  placeholder: string;
  selectedOptions: MultiSelectOption[];
};

type OptionListProps = {
  disabled: boolean;
  emptyText: string;
  onSelect: (value: string) => void;
  options: MultiSelectOption[];
  searchable: boolean;
  searchPlaceholder: string;
  selectedValues: string[];
};

type MultiSelectStateOptions = {
  defaultValue: string[];
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: string[]) => void;
  value?: string[];
};

type MultiSelectTriggerProps = Omit<
  MultiSelectProps,
  | "defaultValue"
  | "emptyText"
  | "onOpenChange"
  | "onValueChange"
  | "options"
  | "searchable"
  | "searchPlaceholder"
  | "value"
> & {
  contentId: string;
  open: boolean;
  selectedOptions: MultiSelectOption[];
};

type MultiSelectContentProps = {
  contentId: string;
  disabled: boolean;
  emptyText: string;
  onSelect: (value: string) => void;
  options: MultiSelectOption[];
  searchable: boolean;
  searchPlaceholder: string;
  selectedValues: string[];
};

function getUniqueValues(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function shouldOpenFromKey(key: string) {
  return key === " " || key === "ArrowDown" || key === "Enter";
}

function TriggerContent({ placeholder, selectedOptions }: TriggerContentProps) {
  if (selectedOptions.length === 0) {
    return <span>{placeholder}</span>;
  }

  return (
    <>
      {selectedOptions.map((option) => (
        <Badge className="max-w-full" key={option.value} variant="secondary">
          <span className="truncate">{option.label}</span>
        </Badge>
      ))}
    </>
  );
}

function OptionList({
  disabled,
  emptyText,
  onSelect,
  options,
  searchable,
  searchPlaceholder,
  selectedValues,
}: OptionListProps) {
  return (
    <Command>
      {searchable ? <CommandInput placeholder={searchPlaceholder} /> : null}
      <CommandList aria-multiselectable="true">
        <CommandEmpty>{emptyText}</CommandEmpty>
        <CommandGroup>
          <div>
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);

              return (
                <CommandItem
                  aria-disabled={option.disabled || undefined}
                  aria-selected={isSelected}
                  className="gap-2"
                  disabled={disabled || option.disabled}
                  key={option.value}
                  onSelect={() => {
                    onSelect(option.value);
                  }}
                  role="option"
                  value={option.label}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border border-input bg-background text-primary transition-opacity",
                      isSelected ? "opacity-100" : "opacity-50",
                    )}
                  >
                    {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span className="flex-1">{option.label}</span>
                </CommandItem>
              );
            })}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function MultiSelectContent({
  contentId,
  disabled,
  emptyText,
  onSelect,
  options,
  searchable,
  searchPlaceholder,
  selectedValues,
}: MultiSelectContentProps) {
  return (
    <PopoverContent
      align="start"
      className="w-[var(--radix-popover-trigger-width)] p-0"
      id={contentId}
    >
      <OptionList
        disabled={disabled}
        emptyText={emptyText}
        onSelect={onSelect}
        options={options}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        selectedValues={selectedValues}
      />
    </PopoverContent>
  );
}

function useMultiSelectState({
  defaultValue,
  onOpenChange,
  onValueChange,
  value,
}: MultiSelectStateOptions) {
  const [open, setOpen] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(() =>
    getUniqueValues(defaultValue),
  );
  const isControlled = value !== undefined;
  const selectedValues = React.useMemo(
    () => getUniqueValues(value ?? uncontrolledValue),
    [uncontrolledValue, value],
  );

  const setSelectedValues = React.useCallback(
    (nextValue: string[]) => {
      const uniqueValues = getUniqueValues(nextValue);

      if (!isControlled) {
        setUncontrolledValue(uniqueValues);
      }

      onValueChange?.(uniqueValues);
    },
    [isControlled, onValueChange],
  );

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange],
  );

  return {
    handleOpenChange,
    open,
    selectedValues,
    setSelectedValues,
  };
}

const MultiSelectTrigger = React.forwardRef<
  HTMLButtonElement,
  MultiSelectTriggerProps
>(
  (
    {
      className,
      contentId,
      disabled = false,
      onKeyDown,
      open,
      placeholder = "Select options",
      selectedOptions,
      ...props
    },
    ref,
  ) => (
    <Button
      aria-controls={contentId}
      aria-expanded={open}
      aria-haspopup="listbox"
      className={cn(
        "min-h-10 w-full justify-between px-3 py-2 text-sm font-normal",
        selectedOptions.length === 0 && "text-muted-foreground",
        className,
      )}
      disabled={disabled}
      onKeyDown={onKeyDown}
      ref={ref}
      role="combobox"
      type="button"
      variant="outline"
      {...props}
    >
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-left">
        <TriggerContent
          placeholder={placeholder}
          selectedOptions={selectedOptions}
        />
      </span>
      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  ),
);
MultiSelectTrigger.displayName = "MultiSelectTrigger";

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      defaultValue = [],
      emptyText = "No options found.",
      onKeyDown,
      onOpenChange,
      onValueChange,
      options,
      searchable = false,
      searchPlaceholder = "Search options...",
      value,
      ...props
    },
    ref,
  ) => {
    const contentId = React.useId();
    const { handleOpenChange, open, selectedValues, setSelectedValues } =
      useMultiSelectState({ defaultValue, onOpenChange, onValueChange, value });
    const selectedOptions = React.useMemo(
      () => options.filter((option) => selectedValues.includes(option.value)),
      [options, selectedValues],
    );

    const handleSelect = React.useCallback(
      (nextValue: string) => {
        const nextSelectedValues = selectedValues.includes(nextValue)
          ? selectedValues.filter((valueItem) => valueItem !== nextValue)
          : [...selectedValues, nextValue];

        setSelectedValues(nextSelectedValues);
      },
      [selectedValues, setSelectedValues],
    );

    const handleTriggerKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);

        if (event.defaultPrevented || props.disabled) {
          return;
        }

        if (shouldOpenFromKey(event.key)) {
          event.preventDefault();
          handleOpenChange(true);
        }
      },
      [handleOpenChange, onKeyDown, props.disabled],
    );

    return (
      <Popover onOpenChange={handleOpenChange} open={open}>
        <PopoverTrigger asChild>
          <MultiSelectTrigger
            {...props}
            contentId={contentId}
            onKeyDown={handleTriggerKeyDown}
            open={open}
            ref={ref}
            selectedOptions={selectedOptions}
          />
        </PopoverTrigger>
        <MultiSelectContent
          contentId={contentId}
          disabled={props.disabled || false}
          emptyText={emptyText}
          onSelect={handleSelect}
          options={options}
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          selectedValues={selectedValues}
        />
      </Popover>
    );
  },
);
MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
