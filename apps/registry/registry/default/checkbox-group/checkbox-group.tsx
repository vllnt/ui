"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";
import { Checkbox } from "@vllnt/ui";
import { Label } from "@vllnt/ui";

type CheckboxGroupContextValue = {
  disabled: boolean;
  name?: string;
  toggle: (value: string) => void;
  values: string[];
};

const CheckboxGroupContext =
  React.createContext<CheckboxGroupContextValue | null>(null);

function useCheckboxGroupContext(): CheckboxGroupContextValue {
  const context = React.useContext(CheckboxGroupContext);
  if (!context) {
    throw new Error("CheckboxGroupItem must be used within a CheckboxGroup");
  }
  return context;
}

function useCheckboxGroupValue(
  value: string[] | undefined,
  defaultValue: string[],
  onValueChange?: (value: string[]) => void,
) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const values = value ?? internalValue;

  const toggle = React.useCallback(
    (item: string) => {
      const nextValues = values.includes(item)
        ? values.filter((entry) => entry !== item)
        : [...values, item];

      if (value === undefined) {
        setInternalValue(nextValues);
      }

      onValueChange?.(nextValues);
    },
    [onValueChange, value, values],
  );

  return { toggle, values };
}

/** Group of related checkboxes backed by an array of selected values. */
export type CheckboxGroupProps = {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string[];
  disabled?: boolean;
  name?: string;
  onValueChange?: (value: string[]) => void;
  orientation?: "horizontal" | "vertical";
  value?: string[];
};

const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      children,
      className,
      defaultValue = [],
      disabled = false,
      name,
      onValueChange,
      orientation = "vertical",
      value,
    },
    ref,
  ) => {
    const { toggle, values } = useCheckboxGroupValue(
      value,
      defaultValue,
      onValueChange,
    );
    const context = React.useMemo<CheckboxGroupContextValue>(
      () => ({ disabled, name, toggle, values }),
      [disabled, name, toggle, values],
    );

    return (
      <CheckboxGroupContext.Provider value={context}>
        <div
          className={cn(
            "flex gap-3",
            orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
            className,
          )}
          ref={ref}
          role="group"
        >
          {children}
        </div>
      </CheckboxGroupContext.Provider>
    );
  },
);
CheckboxGroup.displayName = "CheckboxGroup";

/** Single checkbox plus label wired into the parent CheckboxGroup. */
export type CheckboxGroupItemProps = {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
  value: string;
};

const CheckboxGroupItem = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupItemProps
>(({ children, className, disabled = false, id, value }, ref) => {
  const generatedId = React.useId();
  const itemId = id ?? generatedId;
  const group = useCheckboxGroupContext();
  const checked = group.values.includes(value);

  return (
    <div className={cn("flex items-center gap-2", className)} ref={ref}>
      <Checkbox
        checked={checked}
        disabled={disabled || group.disabled}
        id={itemId}
        name={group.name}
        onCheckedChange={() => {
          group.toggle(value);
        }}
        value={value}
      />
      {children ? <Label htmlFor={itemId}>{children}</Label> : null}
    </div>
  );
});
CheckboxGroupItem.displayName = "CheckboxGroupItem";

export { CheckboxGroup, CheckboxGroupItem };
