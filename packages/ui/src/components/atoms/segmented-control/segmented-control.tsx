"use client";

import { renderElement } from "@ui-sdk/react/primitive";
import {
  SegmentedControl as SegmentedControlPrimitive,
  SegmentedControlItem as SegmentedControlItemPrimitive,
  type SegmentedControlItemState,
} from "@ui-sdk/react/segmented-control";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { asChildProps } from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";

const segmentedControlVariants = cva(
  "inline-flex items-center rounded-lg p-1 text-muted-foreground",
  {
    defaultVariants: {
      fit: false,
      size: "default",
      variant: "filled",
    },
    variants: {
      fit: {
        false: "w-full",
        true: "w-auto [&>*]:flex-none",
      },
      size: {
        default: "min-h-10",
        lg: "min-h-11",
        sm: "min-h-9",
      },
      variant: {
        filled: "bg-secondary",
        hairline: "border border-input bg-transparent",
      },
    },
  },
);

const segmentedControlItemVariants = cva(
  "inline-flex flex-1 items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-all motion-reduce:transition-none outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
  {
    defaultVariants: {
      size: "default",
    },
    variants: {
      size: {
        default: "min-h-8",
        lg: "min-h-9 px-4",
        sm: "min-h-7 px-2.5 text-xs",
      },
    },
  },
);

export type SegmentedControlProps = Omit<
  React.ComponentProps<typeof SegmentedControlPrimitive>,
  "defaultValue" | "onValueChange" | "render" | "value"
> &
  VariantProps<typeof segmentedControlVariants> & {
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    value?: string;
  };

export type SegmentedControlItemProps = Omit<
  React.ComponentProps<typeof SegmentedControlItemPrimitive>,
  "render"
> &
  VariantProps<typeof segmentedControlItemVariants> & {
    asChild?: boolean;
  };

/**
 * Keys ui-sdk leaves out: Enter selects the focused segment instead of
 * submitting a form, and Home and End select the first and last enabled one.
 */
function selectOnKey(event: React.KeyboardEvent<HTMLDivElement>): void {
  // ui-sdk always cancels Enter, so the other keys alone honour a cancel.
  if (event.defaultPrevented && event.key !== "Enter") {
    return;
  }
  const items = [
    ...event.currentTarget.querySelectorAll<HTMLElement>(
      '[role="radio"]:not(:disabled)',
    ),
  ];
  const target =
    event.key === "Enter"
      ? items.find((item) => item === event.target)
      : { End: items.at(-1), Home: items.at(0) }[event.key];
  if (target) {
    event.preventDefault();
    target.focus();
    target.click();
  }
}

/**
 * Single-choice segmented selector.
 *
 * `fit` hugs the content (root `w-auto`, items `flex-none`) instead of filling
 * the row. `variant="hairline"` swaps the filled track for a transparent one
 * with a 1 px border; the border is the input colour, which inside glass is the
 * AA-checked `glass-input`, so set it on the dense glass tint.
 * @example
 * <SegmentedControl aria-label="View" defaultValue="grid" fit variant="hairline">
 *   <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
 *   <SegmentedControlItem value="list">List</SegmentedControlItem>
 * </SegmentedControl>
 */
const SegmentedControl = ({
  className,
  fit,
  onKeyDown,
  onValueChange,
  ref,
  size,
  variant,
  ...props
}: SegmentedControlProps & { ref?: React.Ref<HTMLDivElement> }) => (
  <SegmentedControlPrimitive
    className={cn(segmentedControlVariants({ fit, size, variant }), className)}
    onKeyDown={(event) => {
      onKeyDown?.(event);
      selectOnKey(event);
    }}
    onValueChange={(value) => {
      onValueChange?.(value ?? "");
    }}
    ref={ref}
    {...props}
  />
);
SegmentedControl.displayName = "SegmentedControl";

const SegmentedControlItem = ({
  asChild,
  children,
  className,
  ref,
  size,
  ...props
}: SegmentedControlItemProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const slot = asChildProps({ asChild, children });
  // ui-sdk marks an item of a disabled control with aria-disabled alone; the
  // styles and Radix both use the native attribute, so add it.
  const render = (
    elementProps: React.HTMLAttributes<HTMLElement>,
    state: SegmentedControlItemState,
  ) =>
    renderElement(
      "button",
      {
        ...elementProps,
        "data-state": state.checked ? "on" : "off",
        ...(state.disabled ? { disabled: true } : {}),
      },
      slot.render,
      state,
    );

  return (
    <SegmentedControlItemPrimitive
      className={cn(segmentedControlItemVariants({ size }), className)}
      ref={ref}
      render={render}
      {...props}
    >
      {slot.children}
    </SegmentedControlItemPrimitive>
  );
};
SegmentedControlItem.displayName = "SegmentedControlItem";

export {
  SegmentedControl,
  SegmentedControlItem,
  segmentedControlItemVariants,
  segmentedControlVariants,
};
