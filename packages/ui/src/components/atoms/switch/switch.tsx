"use client";

import {
  Switch as SwitchPrimitive,
  type SwitchState,
  SwitchThumb,
} from "@ui-sdk/react/switch";
import type * as React from "react";

import { checkedState, withDataAttributes } from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";

const Switch = ({
  className,
  ref,
  render,
  ...props
}: Omit<React.ComponentProps<typeof SwitchPrimitive>, "children"> & {
  ref?: React.Ref<HTMLButtonElement>;
}) => (
  <SwitchPrimitive
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className,
    )}
    ref={ref}
    render={withDataAttributes<SwitchState>("button", checkedState, render)}
    {...props}
  >
    <SwitchThumb
      className="pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      render={withDataAttributes("span", checkedState)}
    />
  </SwitchPrimitive>
);
Switch.displayName = "Switch";

export { Switch };
