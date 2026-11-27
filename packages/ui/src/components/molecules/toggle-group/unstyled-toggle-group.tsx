"use client";

import { createContext, use } from "react";

import { renderElement } from "@ui-sdk/react/primitive";
import {
  Toggle,
  ToggleGroup as ToggleGroupPrimitive,
  type ToggleGroupState,
} from "@ui-sdk/react/toggle";
import type * as React from "react";

import { cx } from "../../../lib/cx";
import { named } from "../../../lib/named";
import { asChildProps } from "../../../lib/ui-sdk";

type GroupType = "multiple" | "single";

const GroupTypeContext = createContext<GroupType>("multiple");

/** Props for {@link UnstyledToggleGroup}: `type` picks a string or a list value. */
export type UnstyledToggleGroupProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive>,
  | "children"
  | "className"
  | "controller"
  | "defaultValue"
  | "multiple"
  | "onValueChange"
  | "render"
  | "value"
> & {
  children?: React.ReactNode;
  className?: string;
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

/** Props for {@link UnstyledToggleGroupItem}: a native `<button>` with a `value`. */
export type UnstyledToggleGroupItemProps = Omit<
  React.ComponentProps<typeof Toggle>,
  "className" | "defaultPressed" | "onPressedChange" | "render" | "value"
> & {
  asChild?: boolean;
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
  value: string;
};

/** ui-sdk keeps the pressed values as a list; `""` means none in single mode. */
const toList = (value: string | undefined) =>
  value === undefined ? undefined : value === "" ? [] : [value];

/**
 * `ToggleGroup` without styles: the same behaviour (one tab stop, arrow keys,
 * Home and End, radio items when `type` is `"single"`, else pressed buttons,
 * `disabled`) and no classes of its own. `className` reaches the element as
 * given. This module imports neither `tailwind-merge` nor the variant
 * helpers, so a bundle that uses it alone carries neither. The caller styles
 * the items, for example with `data-[state=on]:` and `focus-visible:` classes.
 * @example
 * <UnstyledToggleGroup aria-label="View" type="single">
 *   <UnstyledToggleGroupItem className="px-3 data-[state=on]:bg-accent" value="grid">Grid</UnstyledToggleGroupItem>
 * </UnstyledToggleGroup>
 */
const UnstyledToggleGroup = /* @__PURE__ */ named(
  "UnstyledToggleGroup",
  ({
    children,
    className,
    ref,
    rovingFocus: _rovingFocus,
    ...props
  }: UnstyledToggleGroupProps) => {
    const { defaultValue, onValueChange, type, value, ...rest } = props;
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
        className={cx(className) || undefined}
        multiple={type === "multiple"}
        ref={ref}
        render={groupRender}
        {...rest}
        {...values}
      >
        <GroupTypeContext.Provider value={type}>
          {children}
        </GroupTypeContext.Provider>
      </ToggleGroupPrimitive>
    );
  },
);

/** One item of an {@link UnstyledToggleGroup}: a native `<button>` with no classes of its own. */
const UnstyledToggleGroupItem = /* @__PURE__ */ named(
  "UnstyledToggleGroupItem",
  ({
    asChild,
    children,
    className,
    ref,
    ...props
  }: UnstyledToggleGroupItemProps) => {
    const single = use(GroupTypeContext) === "single";
    const slot = asChildProps({ asChild, children });
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
        className={cx(className) || undefined}
        ref={ref}
        render={render}
        {...props}
      >
        {slot.children}
      </Toggle>
    );
  },
);

export { UnstyledToggleGroup, UnstyledToggleGroupItem };
