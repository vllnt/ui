"use client";

import { Label as LabelPrimitive } from "@ui-sdk/react/label";
import type * as React from "react";

import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";
import { cva, type VariantProps } from "../../../lib/variants";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = /* @__PURE__ */ named(
  "Label",
  ({
    className,
    onMouseDown,
    ref,
    ...props
  }: React.ComponentProps<typeof LabelPrimitive> &
    VariantProps<typeof labelVariants> & {
      ref?: React.Ref<HTMLLabelElement>;
    }) => (
    <LabelPrimitive
      className={cn(labelVariants(), className)}
      onMouseDown={(event: React.MouseEvent<HTMLLabelElement>) => {
        onMouseDown?.(event);
        // A double click on the text must not select it, unless it hit a control inside.
        if (
          !event.defaultPrevented &&
          event.detail > 1 &&
          !(event.target as Element).closest("button, input, select, textarea")
        ) {
          event.preventDefault();
        }
      }}
      ref={ref}
      {...props}
    />
  ),
);

export { Label };
