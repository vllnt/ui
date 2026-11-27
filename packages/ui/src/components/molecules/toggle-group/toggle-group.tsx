"use client";

import { createContext, use, useMemo } from "react";

import type * as React from "react";

import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";
import type { VariantProps } from "../../../lib/variants";
import { toggleVariants } from "../../atoms/toggle/toggle";

import {
  UnstyledToggleGroup,
  UnstyledToggleGroupItem,
  type UnstyledToggleGroupItemProps,
  type UnstyledToggleGroupProps,
} from "./unstyled-toggle-group";

type ToggleGroupContextValue = VariantProps<typeof toggleVariants>;

const ToggleGroupContext = createContext<ToggleGroupContextValue>({
  size: "default",
  variant: "default",
});

type ToggleGroupProps = UnstyledToggleGroupProps &
  VariantProps<typeof toggleVariants>;

/**
 * Toggles that share one value. A `single` group presses one at a time: it
 * reads as a radio group and its value is a string. The other `type` presses
 * any number: it reads as a toolbar and its value is a list.
 */
const ToggleGroup = /* @__PURE__ */ named(
  "ToggleGroup",
  ({ children, className, size, variant, ...props }: ToggleGroupProps) => {
    const contextValue = useMemo(() => ({ size, variant }), [size, variant]);
    return (
      <UnstyledToggleGroup
        className={cn("flex items-center justify-center gap-1", className)}
        {...props}
      >
        <ToggleGroupContext.Provider value={contextValue}>
          {children}
        </ToggleGroupContext.Provider>
      </UnstyledToggleGroup>
    );
  },
);

type ToggleGroupItemProps = UnstyledToggleGroupItemProps &
  VariantProps<typeof toggleVariants>;

const ToggleGroupItem = /* @__PURE__ */ named(
  "ToggleGroupItem",
  ({ className, size, variant, ...props }: ToggleGroupItemProps) => {
    const context = use(ToggleGroupContext);
    return (
      <UnstyledToggleGroupItem
        className={cn(
          toggleVariants({
            size: context.size ?? size,
            variant: context.variant ?? variant,
          }),
          className,
        )}
        {...props}
      />
    );
  },
);

export { ToggleGroup, ToggleGroupItem };
