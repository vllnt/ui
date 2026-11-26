"use client";

import { Toggle as TogglePrimitive } from "@ui-sdk/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import {
  asChildProps,
  type DataAttributes,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";

const styledToggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-secondary hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
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

type ClassValue = Parameters<typeof cn>[number];

type StyledToggleOptions = NonNullable<
  Parameters<typeof styledToggleVariants>[0]
>;

/** {@link toggleVariants} options: the styled variants plus `"unstyled"`. */
type ToggleVariantOptions = {
  class?: ClassValue;
  className?: ClassValue;
  size?: StyledToggleOptions["size"];
  variant?: "unstyled" | StyledToggleOptions["variant"];
};

/**
 * Toggle classes. `variant: "unstyled"` adds none of its own: the result is
 * the caller's `className` (or `class`), merged with `cn`, and `size` has no
 * effect.
 */
const toggleVariants = (options: ToggleVariantOptions = {}): string => {
  // cva accepted `null` at runtime, outside its type; keep accepting it.
  const { class: classValue, className, size, variant } = options ?? {};
  return variant === "unstyled"
    ? cn(classValue, className)
    : styledToggleVariants({
        // cva flattens the array, so the string matches passing each value.
        className: [classValue, className],
        size,
        variant,
      });
};

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
      // An unstyled toggle with no className renders no class attribute.
      className={cn(toggleVariants({ className, size, variant })) || undefined}
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
