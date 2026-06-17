"use client";

import * as React from "react";

import { Check } from "lucide-react";

import { cn } from "@vllnt/ui";

/** Selection behaviour for a ListBox. */
export type ListBoxSelectionMode = "multiple" | "single";

type ListBoxContextValue = {
  disabled: boolean;
  select: (value: string) => void;
  selectedValues: string[];
};

const ListBoxContext = React.createContext<ListBoxContextValue | null>(null);

function useListBoxContext(): ListBoxContextValue {
  const context = React.use(ListBoxContext);
  if (!context) {
    throw new Error("ListBoxItem must be used within a ListBox");
  }
  return context;
}

type ListBoxSelectionOptions = {
  defaultValue: string[];
  onValueChange?: (value: string[]) => void;
  selectionMode: ListBoxSelectionMode;
  value?: string[];
};

function nextSelection(
  current: string[],
  item: string,
  selectionMode: ListBoxSelectionMode,
): string[] {
  if (selectionMode === "single") {
    return [item];
  }

  return current.includes(item)
    ? current.filter((entry) => entry !== item)
    : [...current, item];
}

function useListBoxSelection({
  defaultValue,
  onValueChange,
  selectionMode,
  value,
}: ListBoxSelectionOptions) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const selectedValues = value ?? internalValue;

  const select = (item: string) => {
    const next = nextSelection(selectedValues, item, selectionMode);
    if (value === undefined) {
      setInternalValue(next);
    }

    onValueChange?.(next);
  };

  return { select, selectedValues };
}

/** Accessible single- or multi-select list of options. */
export type ListBoxProps = {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string[];
  disabled?: boolean;
  label?: string;
  onValueChange?: (value: string[]) => void;
  selectionMode?: ListBoxSelectionMode;
  value?: string[];
};

const ListBox = ({
  children,
  className,
  defaultValue = [],
  disabled = false,
  label,
  onValueChange,
  ref,
  selectionMode = "single",
  value,
}: ListBoxProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const { select, selectedValues } = useListBoxSelection({
    defaultValue,
    onValueChange,
    selectionMode,
    value,
  });
  const context = React.useMemo<ListBoxContextValue>(
    () => ({ disabled, select, selectedValues }),
    [disabled, select, selectedValues],
  );

  return (
    <ListBoxContext.Provider value={context}>
      <div
        aria-label={label}
        aria-multiselectable={selectionMode === "multiple"}
        className={cn(
          "flex flex-col gap-0.5 rounded-md border border-input bg-background p-1",
          className,
        )}
        ref={ref}
        role="listbox"
      >
        {children}
      </div>
    </ListBoxContext.Provider>
  );
};
ListBox.displayName = "ListBox";

/** Single option within a ListBox. */
export type ListBoxItemProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  value: string;
};

const ListBoxItem = ({
  children,
  className,
  disabled = false,
  ref,
  value,
}: ListBoxItemProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const group = useListBoxContext();
  const selected = group.selectedValues.includes(value);
  const isDisabled = disabled || group.disabled;

  const activate = () => {
    if (!isDisabled) {
      group.select(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };

  return (
    <div
      aria-disabled={isDisabled || undefined}
      aria-selected={selected}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "bg-accent text-accent-foreground",
        isDisabled && "pointer-events-none opacity-50",
        className,
      )}
      onClick={activate}
      onKeyDown={handleKeyDown}
      ref={ref}
      role="option"
      tabIndex={isDisabled ? -1 : 0}
    >
      <Check
        className={cn(
          "size-4 shrink-0",
          selected ? "opacity-100" : "opacity-0",
        )}
      />
      <span className="flex-1">{children}</span>
    </div>
  );
};
ListBoxItem.displayName = "ListBoxItem";

export { ListBox, ListBoxItem };
