"use client";

import { createContext, use, useMemo } from "react";

import { renderElement } from "@ui-sdk/react/primitive";
import {
  Toggle,
  ToggleGroup as ToggleGroupPrimitive,
  type ToggleGroupState,
} from "@ui-sdk/react/toggle";
import type * as React from "react";

import { asChildProps } from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";
import type { VariantProps } from "../../../lib/variants";
import { toggleVariants } from "../../atoms/toggle/toggle";

type ToggleGroupContextValue = VariantProps<typeof toggleVariants> & {
  type: "multiple" | "single";
};

const ToggleGroupContext = createContext<ToggleGroupContextValue>({
  size: "default",
  type: "multiple",
  variant: "default",
});

type ToggleGroupProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive>,
  | "children"
  | "controller"
  | "defaultValue"
  | "multiple"
  | "onValueChange"
  | "render"
  | "value"
> &
  VariantProps<typeof toggleVariants> & {
    children?: React.ReactNode;
    ref?: React.Ref<HTMLDivElement>;
    /** Accepted for compatibility and ignored: arrow keys always move focus. */
    rovingFocus?: boolean;
  } & (
    | {
        defaultValue?: string;
        onValueChange?: (value: string) => void;
        type: "single";
        value?: string;
      }
    | {
        defaultValue?: string[];
        onValueChange?: (value: string[]) => void;
        type: "multiple";
        value?: string[];
      }
  );

/** ui-sdk keeps the pressed values as a list; `""` means none in single mode. */
const toList = (value: string | undefined) =>
  value === undefined ? undefined : value === "" ? [] : [value];

/**
 * Toggles that share one value. A `single` group presses one at a time: it
 * reads as a radio group and its value is a string. The other `type` presses
 * any number: it reads as a toolbar and its value is a list.
 */
const ToggleGroup = ({
  children,
  className,
  ref,
  rovingFocus: _rovingFocus,
  size,
  variant,
  ...props
}: ToggleGroupProps) => {
  const { defaultValue, onValueChange, type, value, ...rest } = props;
  const contextValue = useMemo(
    () => ({ size, type, variant }),
    [size, type, variant],
  );
  const values =
    type === "single"
      ? {
          defaultValue: toList(defaultValue),
          onValueChange: (next: string[]) => {
            onValueChange?.(next[0] ?? "");
          },
          value: toList(value),
        }
      : { defaultValue, onValueChange, value };

  // ui-sdk renders a plain group; Radix read as a radio group or a toolbar.
  const groupRender = (
    elementProps: React.HTMLAttributes<HTMLElement>,
    state: ToggleGroupState,
  ) =>
    renderElement(
      "div",
      { ...elementProps, role: type === "single" ? "radiogroup" : "toolbar" },
      undefined,
      state,
    );

  return (
    <ToggleGroupPrimitive
      className={cn("flex items-center justify-center gap-1", className)}
      multiple={type === "multiple"}
      ref={ref}
      render={groupRender}
      {...rest}
      {...values}
    >
      <ToggleGroupContext.Provider value={contextValue}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
};

ToggleGroup.displayName = "ToggleGroup";

type ToggleGroupItemProps = Omit<
  React.ComponentProps<typeof Toggle>,
  "defaultPressed" | "onPressedChange" | "render" | "value"
> &
  VariantProps<typeof toggleVariants> & {
    asChild?: boolean;
    ref?: React.Ref<HTMLButtonElement>;
    value: string;
  };

const ToggleGroupItem = ({
  asChild,
  children,
  className,
  ref,
  size,
  variant,
  ...props
}: ToggleGroupItemProps) => {
  const context = use(ToggleGroupContext);
  const slot = asChildProps({ asChild, children });
  const single = context.type === "single";
  const render = (
    elementProps: React.HTMLAttributes<HTMLElement>,
    state: { pressed: boolean },
  ) =>
    renderElement(
      "button",
      {
        ...elementProps,
        ...(single
          ? {
              "aria-checked": state.pressed,
              "aria-pressed": undefined,
              role: "radio",
            }
          : {}),
        "data-state": state.pressed ? "on" : "off",
      },
      slot.render,
      state,
    );

  return (
    <Toggle
      className={cn(
        toggleVariants({
          size: context.size ?? size,
          variant: context.variant ?? variant,
        }),
        className,
      )}
      ref={ref}
      render={render}
      {...props}
    >
      {slot.children}
    </Toggle>
  );
};

ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
