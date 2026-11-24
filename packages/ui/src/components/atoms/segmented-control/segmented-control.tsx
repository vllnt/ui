"use client";

import * as React from "react";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cva, type VariantProps } from "class-variance-authority";

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
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>,
  "defaultValue" | "onValueChange" | "type" | "value"
> &
  VariantProps<typeof segmentedControlVariants> & {
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    value?: string;
  };

export type SegmentedControlItemProps = React.ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Item
> &
  VariantProps<typeof segmentedControlItemVariants>;

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
  ref,
  size,
  variant,
  ...props
}: SegmentedControlProps & {
  ref?: React.Ref<React.ComponentRef<typeof ToggleGroupPrimitive.Root>>;
}) => (
  <ToggleGroupPrimitive.Root
    className={cn(segmentedControlVariants({ fit, size, variant }), className)}
    ref={ref}
    type="single"
    {...props}
  />
);
SegmentedControl.displayName = "SegmentedControl";

const SegmentedControlItem = ({
  className,
  ref,
  size,
  ...props
}: SegmentedControlItemProps & {
  ref?: React.Ref<React.ComponentRef<typeof ToggleGroupPrimitive.Item>>;
}) => (
  <ToggleGroupPrimitive.Item
    className={cn(segmentedControlItemVariants({ size }), className)}
    ref={ref}
    {...props}
  />
);
SegmentedControlItem.displayName = "SegmentedControlItem";

export {
  SegmentedControl,
  SegmentedControlItem,
  segmentedControlItemVariants,
  segmentedControlVariants,
};
