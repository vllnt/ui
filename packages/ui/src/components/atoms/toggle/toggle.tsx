"use client";

import { Toggle as TogglePrimitive } from "@ui-sdk/react/toggle";
import type * as React from "react";

import {
  asChildProps,
  type DataAttributes,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";
import { cva, type VariantProps } from "../../../lib/variants";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-secondary hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground forced-colors:data-[state=on]:bg-[color:Highlight] forced-colors:data-[state=on]:text-[color:HighlightText] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 px-3 min-w-10",
        lg: "h-11 px-5 min-w-11",
        sm: "h-9 px-2.5 min-w-9",
      },
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
    },
  },
);

const pressedState = (state: { pressed: boolean }): DataAttributes => ({
  "data-state": state.pressed ? "on" : "off",
});

type ToggleProps = Omit<
  React.ComponentProps<typeof TogglePrimitive>,
  "render" | "value"
> &
  VariantProps<typeof toggleVariants> & {
    asChild?: boolean;
    ref?: React.Ref<HTMLButtonElement>;
  };

const Toggle = ({
  asChild,
  children,
  className,
  ref,
  size,
  variant,
  ...props
}: ToggleProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <TogglePrimitive
      className={cn(toggleVariants({ className, size, variant }))}
      ref={ref}
      render={withDataAttributes("button", pressedState, slot.render)}
      {...props}
    >
      {slot.children}
    </TogglePrimitive>
  );
};

Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };
