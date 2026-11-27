"use client";

import {
  Switch as SwitchPrimitive,
  type SwitchState,
  SwitchThumb,
} from "@ui-sdk/react/switch";
import type * as React from "react";

import { HIT_AREA_24 } from "../../../lib/hit-area";
import { named } from "../../../lib/named";
import { checkedState, withDataAttributes } from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";

const Switch = /* @__PURE__ */ named(
  "Switch",
  ({
    className,
    ref,
    render,
    ...props
  }: Omit<React.ComponentProps<typeof SwitchPrimitive>, "children"> & {
    ref?: React.Ref<HTMLButtonElement>;
  }) => (
    <SwitchPrimitive
      className={cn(
        HIT_AREA_24,
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input forced-colors:border-[color:ButtonText] forced-colors:data-[state=checked]:bg-[color:Highlight] forced-colors:data-[state=unchecked]:bg-[color:Canvas]",
        className,
      )}
      ref={ref}
      render={withDataAttributes<SwitchState>("button", checkedState, render)}
      {...props}
    >
      <SwitchThumb
        className="pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 forced-colors:bg-[color:ButtonText] forced-colors:data-[state=checked]:bg-[color:HighlightText]"
        render={withDataAttributes("span", checkedState)}
      />
    </SwitchPrimitive>
  ),
);

export { Switch };
