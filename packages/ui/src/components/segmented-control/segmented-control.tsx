"use client";

import * as React from "react";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const segmentedControlVariants = cva(
  "inline-flex w-full items-center rounded-lg bg-muted p-1 text-muted-foreground",
  {
    defaultVariants: {
      size: "default",
    },
    variants: {
      size: {
        default: "min-h-10",
        lg: "min-h-11",
        sm: "min-h-9",
      },
    },
  },
);

const segmentedControlItemVariants = cva(
  "inline-flex flex-1 items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-all outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
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

const SegmentedControl = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Root>,
  SegmentedControlProps
>(({ className, size, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    className={cn(segmentedControlVariants({ size }), className)}
    ref={ref}
    type="single"
    {...props}
  />
));
SegmentedControl.displayName = "SegmentedControl";

const SegmentedControlItem = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Item>,
  SegmentedControlItemProps
>(({ className, size, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    className={cn(segmentedControlItemVariants({ size }), className)}
    ref={ref}
    {...props}
  />
));
SegmentedControlItem.displayName = "SegmentedControlItem";

export {
  SegmentedControl,
  SegmentedControlItem,
  segmentedControlItemVariants,
  segmentedControlVariants,
};
