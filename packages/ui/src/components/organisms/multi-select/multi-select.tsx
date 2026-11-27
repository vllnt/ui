"use client";

import * as React from "react";

import { Check, ChevronDown } from "lucide-react";

import { named } from "../../../lib/named";
import { useControllableState } from "../../../lib/use-controllable-state";
import { cn } from "../../../lib/utils";
import { Badge } from "../../atoms/badge/badge";
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

export type MultiSelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export type MultiSelectProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "defaultValue" | "onChange" | "value"
> & {
  /** Whether the list is open at first. Ignored once `open` has a value. */
  defaultOpen?: boolean;
  defaultValue?: string[];
  emptyText?: string;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: string[]) => void;
  /** Controls whether the list is open. */
  open?: boolean;
  options: MultiSelectOption[];
  placeholder?: string;
  /**
   * Accessible name of the popover dialog. Defaults to `aria-label`, then
   * `placeholder`.
   */
  popoverLabel?: string;
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
  defaultOpen: boolean;
  defaultValue: string[];
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: string[]) => void;
  open?: boolean;
  value?: string[];
};

type MultiSelectTriggerProps = Omit<
  MultiSelectProps,
  | "defaultOpen"
  | "defaultValue"
  | "emptyText"
  | "onOpenChange"
  | "onValueChange"
  | "open"
  | "options"
  | "popoverLabel"
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
  label: string;
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
  const selectedSet = new Set(selectedValues);

  return (
    <Command>
      {searchable ? <CommandInput placeholder={searchPlaceholder} /> : null}
      <CommandList aria-multiselectable="true">
        <CommandEmpty>{emptyText}</CommandEmpty>
        <CommandGroup>
          <div>
            {options.map((option) => {
              const isSelected = selectedSet.has(option.value);

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
                      "flex size-4 items-center justify-center rounded-sm border border-input bg-background text-primary transition-opacity",
                      isSelected ? "opacity-100" : "opacity-50",
                    )}
                  >
                    {isSelected ? <Check className="size-3.5" /> : null}
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
  label,
  onSelect,
  options,
  searchable,
  searchPlaceholder,
  selectedValues,
}: MultiSelectContentProps) {
  return (
    <PopoverContent
      align="start"
      aria-label={label}
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
  defaultOpen,
  defaultValue,
  onOpenChange,
  onValueChange,
  open: openProperty,
  value,
}: MultiSelectStateOptions) {
  const [open, handleOpenChange] = useControllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: openProperty,
  });
  const [values, setValues] = useControllableState({
    defaultValue,
    onChange: onValueChange,
    value,
  });
  const selectedValues = React.useMemo(() => getUniqueValues(values), [values]);

  const handleSelect = React.useCallback(
    (nextValue: string) => {
      const nextSelectedValues = selectedValues.includes(nextValue)
        ? selectedValues.filter((valueItem) => valueItem !== nextValue)
        : [...selectedValues, nextValue];

      setValues(getUniqueValues(nextSelectedValues));
    },
    [selectedValues, setValues],
  );

  return {
    handleOpenChange,
    handleSelect,
    open,
    selectedValues,
  };
}

const MultiSelectTrigger = /* @__PURE__ */ named(
  "MultiSelectTrigger",
  ({
    className,
    contentId,
    disabled = false,
    onKeyDown,
    open,
    placeholder = "Select options",
    ref,
    selectedOptions,
    ...props
  }: MultiSelectTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) => (
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
      <ChevronDown
        aria-hidden="true"
        className="ml-2 size-4 shrink-0 opacity-50"
      />
    </Button>
  ),
);

function resolvePopoverLabel(
  popoverLabel: string | undefined,
  props: Pick<MultiSelectProps, "aria-label" | "placeholder">,
): string {
  return (
    popoverLabel ?? props["aria-label"] ?? props.placeholder ?? "Select options"
  );
}

const MultiSelect = /* @__PURE__ */ named(
  "MultiSelect",
  ({
    defaultOpen = false,
    defaultValue = [],
    emptyText = "No options found.",
    onKeyDown,
    onOpenChange,
    onValueChange,
    open: openProperty,
    options,
    popoverLabel,
    ref,
    searchable = false,
    searchPlaceholder = "Search options...",
    value,
    ...props
  }: MultiSelectProps & { ref?: React.Ref<HTMLButtonElement> }) => {
    const contentId = React.useId();
    const { handleOpenChange, handleSelect, open, selectedValues } =
      useMultiSelectState({
        defaultOpen,
        defaultValue,
        onOpenChange,
        onValueChange,
        open: openProperty,
        value,
      });
    const selectedOptions = React.useMemo(() => {
      const selectedSet = new Set(selectedValues);

      return options.filter((option) => selectedSet.has(option.value));
    }, [options, selectedValues]);

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
          label={resolvePopoverLabel(popoverLabel, props)}
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

export { MultiSelect };
