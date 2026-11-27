"use client";

import * as React from "react";

import { Listbox, ListboxItem } from "@ui-sdk/react/listbox";
import { mergeProps, renderElement } from "@ui-sdk/react/primitive";
import { Check } from "lucide-react";

import { named } from "../../../lib/named";
import { reselectProps } from "../../../lib/reselect";
import { cn } from "../../../lib/utils";

/** Selection behaviour for a ListBox. */
export type ListBoxSelectionMode = "multiple" | "single";

/** The kit's value is always a list; ui-sdk's single mode holds one value or `null`. */
function toPrimitiveValue(
  values: string[] | undefined,
  multiple: boolean,
): null | string | string[] | undefined {
  if (values === undefined) return undefined;
  return multiple ? values : (values[0] ?? null);
}

function toValues(next: null | string | string[]): string[] {
  if (Array.isArray(next)) return next;
  return next === null ? [] : [next];
}

/**
 * Reports a press on the selected option of a single-select list, which
 * ui-sdk ignores. Left `undefined` in a multi-select list: there a press
 * deselects.
 */
const ReselectContext = React.createContext<
  ((value: string) => void) | undefined
>(undefined);

/**
 * Accessible single- or multi-select list of options (WAI-ARIA APG listbox):
 * one tab stop, ArrowUp / ArrowDown / Home / End move focus between enabled
 * options, Enter or Space toggles selection.
 */
export type ListBoxProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "defaultValue" | "onChange" | "value"
> & {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string[];
  disabled?: boolean;
  label?: string;
  onValueChange?: (value: string[]) => void;
  selectionMode?: ListBoxSelectionMode;
  value?: string[];
};

const ListBox = /* @__PURE__ */ named(
  "ListBox",
  ({
    children,
    className,
    defaultValue = [],
    disabled = false,
    label,
    onValueChange,
    ref,
    selectionMode = "single",
    value,
    ...props
  }: ListBoxProps & { ref?: React.Ref<HTMLDivElement> }) => {
    const multiple = selectionMode === "multiple";
    // A press on the selected option still reports the value, as before ui-sdk.
    const reselect = React.useMemo(
      () =>
        multiple
          ? undefined
          : (item: string) => {
              onValueChange?.([item]);
            },
      [multiple, onValueChange],
    );

    return (
      <ReselectContext value={reselect}>
        <Listbox<string, boolean>
          {...props}
          // Keys move focus and Enter, Space or a press selects, as before.
          activation="manual"
          aria-label={label}
          className={cn(
            "flex flex-col gap-0.5 rounded-md border border-input bg-background p-1",
            className,
          )}
          defaultValue={toPrimitiveValue(defaultValue, multiple)}
          disabled={disabled}
          loop={false}
          multiple={multiple}
          onValueChange={(next) => {
            onValueChange?.(toValues(next));
          }}
          ref={ref}
          tabIndex={-1}
          value={toPrimitiveValue(value, multiple)}
        >
          {children}
        </Listbox>
      </ReselectContext>
    );
  },
);

/** Classes of an option, which change with its selected and disabled state. */
function getItemClassName(className: string | undefined) {
  return ({ disabled, selected }: { disabled: boolean; selected: boolean }) =>
    cn(
      "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
      selected && "bg-accent text-accent-foreground",
      disabled && "pointer-events-none opacity-50",
      className,
    );
}

/** Single option within a ListBox. */
export type ListBoxItemProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "value"
> & {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  value: string;
};

const ListBoxItem = /* @__PURE__ */ named(
  "ListBoxItem",
  ({
    children,
    className,
    disabled = false,
    ref,
    value,
    ...props
  }: ListBoxItemProps & { ref?: React.Ref<HTMLDivElement> }) => {
    const reselect = React.use(ReselectContext);
    const onReselect = reselect
      ? () => {
          reselect(value);
        }
      : undefined;
    const renderItem = (
      elementProps: Record<string, unknown>,
      state: { disabled: boolean; selected: boolean },
    ) =>
      renderElement(
        "div",
        state.selected && !state.disabled
          ? mergeProps(
              elementProps,
              reselectProps(onReselect, { keyboard: true }),
            )
          : elementProps,
        undefined,
        state,
      );

    return (
      <ListboxItem
        {...props}
        className={getItemClassName(className)}
        data-value={value}
        disabled={disabled}
        ref={ref}
        render={renderItem}
        value={value}
      >
        {({ selected }) => (
          <>
            <Check
              className={cn(
                "size-4 shrink-0",
                selected ? "opacity-100" : "opacity-0",
              )}
            />
            <span className="flex-1">{children}</span>
          </>
        )}
      </ListboxItem>
    );
  },
);

export { ListBox, ListBoxItem };
