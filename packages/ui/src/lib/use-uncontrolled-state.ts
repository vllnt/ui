"use client";

import { useCallback, useState } from "react";

import type { Dispatch, SetStateAction } from "react";

export function useUncontrolledState<T>(
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  return useState<T>(defaultValue);
}

type ControllableStateOptions<T> = {
  defaultValue: T;
  onChange?: (value: T) => void;
  value?: T;
};

export function useControllableState<T>({
  defaultValue,
  onChange,
  value,
}: ControllableStateOptions<T>): [T, Dispatch<SetStateAction<T>>] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const resolvedValue = isControlled ? value : uncontrolledValue;

  const setValue = useCallback<Dispatch<SetStateAction<T>>>(
    (nextValue) => {
      const resolvedNextValue =
        typeof nextValue === "function"
          ? (nextValue as (currentValue: T) => T)(resolvedValue)
          : nextValue;

      if (!isControlled) {
        setUncontrolledValue(resolvedNextValue);
      }

      onChange?.(resolvedNextValue);
    },
    [isControlled, onChange, resolvedValue],
  );

  return [resolvedValue, setValue];
}
