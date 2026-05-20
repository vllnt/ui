"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Dispatch, SetStateAction } from "react";

/**
 * Always-uncontrolled state hook.
 *
 * Pairs with `useControllableState` as the explicit uncontrolled form.
 * Both return a `[value, setValue]` tuple so callers can swap between them
 * without changing destructuring — callers may later add a controlled `value`
 * prop and switch to `useControllableState` at that point.
 *
 * @param defaultValue - Initial state value (read once on mount, like `useState`).
 * @returns A `[value, setValue]` tuple identical to `useState`.
 *
 * @example
 * const [open, setOpen] = useUncontrolledState(false);
 */
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

type StateUpdater<T> = (currentValue: T) => T;

function isStateUpdater<T>(value: SetStateAction<T>): value is StateUpdater<T> {
  return typeof value === "function";
}

function resolveStateAction<T>(
  nextValue: SetStateAction<T>,
  currentValue: T,
): T {
  return isStateUpdater(nextValue) ? nextValue(currentValue) : nextValue;
}

export function useControllableState<T>({
  defaultValue,
  onChange,
  value,
}: ControllableStateOptions<T>): [T, Dispatch<SetStateAction<T>>] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue);
  const uncontrolledValueRef = useRef(uncontrolledValue);
  const isControlled = value !== undefined;
  const resolvedValue = isControlled ? value : uncontrolledValue;

  useEffect(() => {
    if (!isControlled) {
      uncontrolledValueRef.current = uncontrolledValue;
    }
  }, [isControlled, uncontrolledValue]);

  const setValue = useCallback<Dispatch<SetStateAction<T>>>(
    (nextValue) => {
      if (!isControlled) {
        const resolvedNextValue = resolveStateAction(
          nextValue,
          uncontrolledValueRef.current,
        );
        uncontrolledValueRef.current = resolvedNextValue;
        setUncontrolledValue(resolvedNextValue);
        onChange?.(resolvedNextValue);
        return;
      }

      const resolvedNextValue = resolveStateAction(nextValue, resolvedValue);
      onChange?.(resolvedNextValue);
    },
    [isControlled, onChange, resolvedValue],
  );

  return [resolvedValue, setValue];
}
