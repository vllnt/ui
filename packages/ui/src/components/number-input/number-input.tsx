"use client";

import * as React from "react";

import { Minus, Plus } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";

export type NumberInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "defaultValue" | "onChange" | "type" | "value"
> & {
  defaultValue?: number;
  onValueChange?: (value?: number) => void;
  step?: number;
  value?: number;
};

function getNumericBound(bound: number | string | undefined) {
  if (bound === undefined) {
    return;
  }

  const parsedBound = Number(bound);
  return Number.isNaN(parsedBound) ? undefined : parsedBound;
}

function useNumberInputState(
  controlledValue: number | undefined,
  defaultValue: number | undefined,
  onValueChange?: (value?: number) => void,
) {
  const [internalValue, setInternalValue] = React.useState<number | undefined>(
    defaultValue,
  );
  const resolvedValue = controlledValue ?? internalValue;

  const commitValue = (nextValue?: number) => {
    if (controlledValue === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  return { commitValue, resolvedValue };
}

function clampNumber(
  nextValue: number,
  min: number | undefined,
  max: number | undefined,
) {
  let result = nextValue;

  if (min !== undefined) {
    result = Math.max(min, result);
  }
  if (max !== undefined) {
    result = Math.min(max, result);
  }

  return result;
}

function StepButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "decrement" | "increment";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      className={cn(
        "h-full px-3",
        direction === "decrement"
          ? "rounded-r-none border-r"
          : "rounded-l-none border-l",
      )}
      disabled={disabled}
      onClick={onClick}
      tabIndex={-1}
      type="button"
      variant="ghost"
    >
      {direction === "decrement" ? (
        <Minus className="h-4 w-4" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
    </Button>
  );
}

function NumberInputField({
  disabled,
  onValueChange,
  placeholder,
  reference,
  resolvedValue,
  ...props
}: React.ComponentPropsWithoutRef<"input"> & {
  onValueChange: (value?: number) => void;
  reference: React.ForwardedRef<HTMLInputElement>;
  resolvedValue?: number;
}) {
  return (
    <input
      {...props}
      className="h-full w-full border-0 bg-transparent px-3 text-center text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      disabled={disabled}
      inputMode="decimal"
      onChange={(event) => {
        if (event.target.value === "") {
          onValueChange();
          return;
        }

        const parsedValue = Number(event.target.value);
        if (!Number.isNaN(parsedValue)) {
          onValueChange(parsedValue);
        }
      }}
      placeholder={placeholder}
      ref={reference}
      type="number"
      value={resolvedValue ?? ""}
    />
  );
}

function NumberInputComponent(
  {
    className,
    defaultValue,
    disabled,
    max,
    min,
    onValueChange,
    placeholder,
    step = 1,
    value,
    ...props
  }: NumberInputProps,
  reference: React.ForwardedRef<HTMLInputElement>,
) {
  const { commitValue, resolvedValue } = useNumberInputState(
    value,
    defaultValue,
    onValueChange,
  );
  const parsedMin = getNumericBound(min);
  const parsedMax = getNumericBound(max);

  const handleStepChange = (direction: number) => {
    const baseValue = resolvedValue ?? parsedMin ?? 0;
    commitValue(
      clampNumber(baseValue + direction * step, parsedMin, parsedMax),
    );
  };

  return (
    <div
      className={cn(
        "flex h-10 w-full items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <StepButton
        direction="decrement"
        disabled={disabled}
        onClick={() => {
          handleStepChange(-1);
        }}
      />
      <NumberInputField
        {...props}
        disabled={disabled}
        onValueChange={(nextValue) => {
          commitValue(
            nextValue === undefined
              ? undefined
              : clampNumber(nextValue, parsedMin, parsedMax),
          );
        }}
        placeholder={placeholder}
        reference={reference}
        resolvedValue={resolvedValue}
      />
      <StepButton
        direction="increment"
        disabled={disabled}
        onClick={() => {
          handleStepChange(1);
        }}
      />
    </div>
  );
}

const NumberInput = React.forwardRef(NumberInputComponent);
NumberInput.displayName = "NumberInput";

export { NumberInput };
