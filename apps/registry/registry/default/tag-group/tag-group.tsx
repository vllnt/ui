"use client";

import * as React from "react";

import { X } from "lucide-react";

import { cn } from "@vllnt/ui";

/** Selection behaviour for a TagGroup. */
export type TagSelectionMode = "multiple" | "none" | "single";

type TagGroupContextValue = {
  disabled: boolean;
  select: (value: string) => void;
  selectedValues: string[];
  selectionMode: TagSelectionMode;
};

const TagGroupContext = React.createContext<null | TagGroupContextValue>(null);

function useTagGroupContext(): TagGroupContextValue {
  const context = React.use(TagGroupContext);
  if (!context) {
    throw new Error("TagGroupItem must be used within a TagGroup");
  }
  return context;
}

type TagSelectionOptions = {
  defaultValue: string[];
  onValueChange?: (value: string[]) => void;
  selectionMode: TagSelectionMode;
  value?: string[];
};

function nextSelection(
  current: string[],
  item: string,
  selectionMode: TagSelectionMode,
): string[] {
  if (selectionMode === "single") {
    return current.includes(item) ? [] : [item];
  }

  return current.includes(item)
    ? current.filter((entry) => entry !== item)
    : [...current, item];
}

function useTagSelection({
  defaultValue,
  onValueChange,
  selectionMode,
  value,
}: TagSelectionOptions) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const selectedValues = value ?? internalValue;

  const select = (item: string) => {
    if (selectionMode === "none") {
      return;
    }

    const next = nextSelection(selectedValues, item, selectionMode);
    if (value === undefined) {
      setInternalValue(next);
    }

    onValueChange?.(next);
  };

  return { select, selectedValues };
}

/** Labelled set of tags supporting selection and removal. */
export type TagGroupProps = {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string[];
  disabled?: boolean;
  label?: string;
  onValueChange?: (value: string[]) => void;
  selectionMode?: TagSelectionMode;
  value?: string[];
};

const TagGroup = ({
  children,
  className,
  defaultValue = [],
  disabled = false,
  label,
  onValueChange,
  ref,
  selectionMode = "none",
  value,
}: TagGroupProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const { select, selectedValues } = useTagSelection({
    defaultValue,
    onValueChange,
    selectionMode,
    value,
  });
  const context = React.useMemo<TagGroupContextValue>(
    () => ({ disabled, select, selectedValues, selectionMode }),
    [disabled, select, selectedValues, selectionMode],
  );

  return (
    <TagGroupContext.Provider value={context}>
      <div
        aria-label={label}
        className={cn("flex flex-wrap items-center gap-2", className)}
        ref={ref}
        role="group"
      >
        {children}
      </div>
    </TagGroupContext.Provider>
  );
};
TagGroup.displayName = "TagGroup";

/** Single chip within a TagGroup, optionally selectable and removable. */
export type TagGroupItemProps = {
  children: React.ReactNode;
  className?: string;
  onRemove?: () => void;
  value: string;
};

const TagGroupItem = ({
  children,
  className,
  onRemove,
  ref,
  value,
}: TagGroupItemProps & { ref?: React.Ref<HTMLSpanElement> }) => {
  const { disabled, select, selectedValues, selectionMode } =
    useTagGroupContext();
  const selectable = selectionMode !== "none";
  const selected = selectedValues.includes(value);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors",
        selected
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border bg-muted text-foreground",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      data-selected={selected || undefined}
      ref={ref}
    >
      {selectable ? (
        <button
          aria-pressed={selected}
          className="outline-none focus-visible:underline"
          disabled={disabled}
          onClick={() => {
            select(value);
          }}
          type="button"
        >
          {children}
        </button>
      ) : (
        <span>{children}</span>
      )}
      {onRemove ? (
        <button
          aria-label="Remove tag"
          className="rounded-sm opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
          disabled={disabled}
          onClick={onRemove}
          type="button"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </span>
  );
};
TagGroupItem.displayName = "TagGroupItem";

export { TagGroup, TagGroupItem };
