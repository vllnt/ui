"use client";

import {
  Radio,
  RadioGroup as RadioGroupPrimitive,
  RadioIndicator,
  type RadioState,
} from "@ui-sdk/react/radio";
import { Circle } from "lucide-react";
import type * as React from "react";

import { HIT_AREA_24 } from "../../../lib/hit-area";
import { checkedState, withDataAttributes } from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";

type RadioGroupProps = Omit<
  React.ComponentProps<typeof RadioGroupPrimitive>,
  "defaultValue" | "onValueChange" | "value"
> & {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Names the layout for assistive tech and styling. Arrow keys move along both axes. */
  orientation?: "horizontal" | "vertical";
  ref?: React.Ref<HTMLDivElement>;
  value?: string;
};

const RadioGroup = ({
  className,
  onValueChange,
  orientation,
  ref,
  ...props
}: RadioGroupProps) => {
  return (
    <RadioGroupPrimitive
      aria-orientation={orientation}
      className={cn("grid gap-2", className)}
      data-orientation={orientation}
      onValueChange={(value) => {
        onValueChange?.(value ?? "");
      }}
      ref={ref}
      {...props}
    />
  );
};
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = ({
  className,
  ref,
  render,
  ...props
}: Omit<React.ComponentProps<typeof Radio>, "children"> & {
  ref?: React.Ref<HTMLButtonElement>;
}) => {
  return (
    <Radio
      className={cn(
        HIT_AREA_24,
        "aspect-square size-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      render={withDataAttributes<RadioState>("button", checkedState, render)}
      {...props}
    >
      <RadioIndicator
        className="flex items-center justify-center"
        render={withDataAttributes("span", checkedState)}
      >
        <Circle className="size-2.5 fill-current text-current" />
      </RadioIndicator>
    </Radio>
  );
};
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
