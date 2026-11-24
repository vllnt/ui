"use client";

import {
  Checkbox as CheckboxPrimitive,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox";
import { Check } from "lucide-react";
import type * as React from "react";

import { checkedState, withDataAttributes } from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";

const Checkbox = ({
  className,
  ref: reference,
  render,
  ...props
}: Omit<React.ComponentProps<typeof CheckboxPrimitive>, "children"> & {
  ref?: React.Ref<HTMLButtonElement>;
}) => (
  <CheckboxPrimitive
    className={cn(
      "peer size-4 shrink-0 rounded border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary",
      className,
    )}
    ref={reference}
    render={withDataAttributes("button", checkedState, render)}
    {...props}
  >
    <CheckboxIndicator
      className="flex items-center justify-center text-current"
      render={withDataAttributes("span", checkedState)}
    >
      <Check className="size-4" />
    </CheckboxIndicator>
  </CheckboxPrimitive>
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
