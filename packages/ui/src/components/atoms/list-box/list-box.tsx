"use client";

import * as React from "react";

import { Check } from "lucide-react";

import { moveRovingFocus } from "../../../lib/roving-focus";
import { cn } from "../../../lib/utils";

/** Selection behaviour for a ListBox. */
export type ListBoxSelectionMode = "multiple" | "single";

type ListBoxContextValue = {
  disabled: boolean;
  select: (value: string) => void;
  selectedValues: string[];
  setTabStop: (value: string) => void;
  tabStop: string | undefined;
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

const OPTION_SELECTOR = '[role="option"]';

function enabledOptionValues(root: HTMLElement): string[] {
  return [...root.querySelectorAll<HTMLElement>(OPTION_SELECTOR)]
    .filter((option) => option.getAttribute("aria-disabled") !== "true")
    .map((option) => option.dataset.value ?? "");
}

/**
 * Keeps exactly one option in the tab order (roving tabindex): the option the
 * user last focused while focus is inside the list, otherwise the first
 * selected enabled option, otherwise the first enabled option.
 */
function useRovingTabStop(selectedValues: string[]) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [tabStop, setTabStop] = React.useState<string | undefined>();

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const values = enabledOptionValues(root);
    const focusInside = root.contains(document.activeElement);
    if (focusInside && tabStop !== undefined && values.includes(tabStop)) {
      return;
    }
    const preferred =
      values.find((entry) => selectedValues.includes(entry)) ?? values[0];
    if (preferred !== tabStop) setTabStop(preferred);
  });

  return { rootRef, setTabStop, tabStop };
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null): void {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }
}

function handleListKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
  moveRovingFocus(event, OPTION_SELECTOR, {
    loop: false,
    orientation: "vertical",
  });
}

/**
 * Accessible single- or multi-select list of options (WAI-ARIA APG listbox):
 * one tab stop, ArrowUp / ArrowDown / Home / End move focus between enabled
 * options, Enter or Space toggles selection.
 */
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
  const { rootRef, setTabStop, tabStop } = useRovingTabStop(selectedValues);
  const context = React.useMemo<ListBoxContextValue>(
    () => ({ disabled, select, selectedValues, setTabStop, tabStop }),
    [disabled, select, selectedValues, setTabStop, tabStop],
  );
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      assignRef(ref, node);
    },
    [ref, rootRef],
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
        onKeyDown={handleListKeyDown}
        ref={setRefs}
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
      data-value={value}
      onClick={activate}
      onFocus={() => {
        group.setTabStop(value);
      }}
      onKeyDown={handleKeyDown}
      ref={ref}
      role="option"
      tabIndex={!isDisabled && group.tabStop === value ? 0 : -1}
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
