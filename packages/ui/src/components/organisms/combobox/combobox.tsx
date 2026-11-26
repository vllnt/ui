"use client";

import * as React from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { useControllableState } from "../../../lib/use-controllable-state";
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
  "aria-describedby"?: string;
  /**
   * Accessible name for the trigger when no `<label>` points at `id`. The
   * chosen option's label follows it in the name.
   */
  "aria-label"?: string;
  /** Like `aria-label`, from the element with this id. */
  "aria-labelledby"?: string;
  className?: string;
  commandClassName?: string;
  /** Whether the list is open at first. Ignored once `open` has a value. */
  defaultOpen?: boolean;
  /** The chosen option's value at first. Ignored once `value` has a value. */
  defaultValue?: string;
  /** Disables the trigger. */
  disabled?: boolean;
  emptyText?: string;
  /**
   * Id for the trigger button, e.g. for `<label htmlFor>`. The chosen option's
   * label follows that label in the trigger's name.
   */
  id?: string;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: string) => void;
  /** Controls whether the list is open. */
  open?: boolean;
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

function labelledByIds({
  ariaLabel,
  ariaLabelledBy,
  id,
  triggerId,
  valueId,
}: {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  id?: string;
  triggerId: string;
  valueId: string;
}): string | undefined {
  if (ariaLabelledBy !== undefined) {
    return `${ariaLabelledBy} ${valueId}`;
  }
  // The trigger names itself: its `aria-label`, or the `<label>` for its id.
  return ariaLabel !== undefined || id !== undefined
    ? `${triggerId} ${valueId}`
    : undefined;
}

/**
 * Ids of the popover, the trigger and its value text, and the trigger's
 * `aria-labelledby`. `aria-label` and a `<label>` replace the button's text in
 * its name, which would hide the chosen option, so the name takes that label
 * first and the value after it.
 */
function useTriggerNaming(names: {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  id?: string;
}) {
  const contentId = React.useId();
  const triggerId = names.id ?? `${contentId}-trigger`;
  const valueId = `${contentId}-value`;
  const labelledBy = labelledByIds({ ...names, triggerId, valueId });

  return { contentId, labelledBy, triggerId, valueId };
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
      // `aria-selected` is ui-sdk's, and follows the highlight.
      aria-checked={selectedValue === option.value}
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
  contentId,
  emptyText,
  label,
  onSelect,
  options,
  resolvedValue,
  searchPlaceholder,
}: {
  className?: string;
  commandClassName?: string;
  contentId: string;
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
      id={contentId}
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

type ComboboxStateOptions = Pick<
  ComboboxProps,
  | "defaultOpen"
  | "defaultValue"
  | "onOpenChange"
  | "onValueChange"
  | "open"
  | "options"
  | "value"
>;

function useComboboxState({
  defaultOpen = false,
  defaultValue = "",
  onOpenChange,
  onValueChange,
  open: openProperty,
  options,
  value,
}: ComboboxStateOptions) {
  const [open, setOpen] = useControllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: openProperty,
  });
  const [resolvedValue, setResolvedValue] = useControllableState({
    defaultValue,
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

  return { handleSelect, open, resolvedValue, selectedOption, setOpen };
}

const Combobox = ({
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  commandClassName,
  disabled,
  emptyText = "No option found.",
  id,
  options,
  placeholder = "Select an option",
  popoverLabel,
  ref: reference,
  searchPlaceholder = "Search options...",
  triggerClassName,
  ...stateProps
}: ComboboxProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const naming = useTriggerNaming({ ariaLabel, ariaLabelledBy, id });
  const { handleSelect, open, resolvedValue, selectedOption, setOpen } =
    useComboboxState({ ...stateProps, options });

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-controls={naming.contentId}
          aria-describedby={ariaDescribedBy}
          aria-expanded={open}
          aria-label={ariaLabel}
          aria-labelledby={naming.labelledBy}
          className={cn("w-full justify-between", triggerClassName)}
          disabled={disabled}
          id={naming.triggerId}
          ref={reference}
          role="combobox"
          variant="outline"
        >
          <span className="truncate" id={naming.valueId}>
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
        contentId={naming.contentId}
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
