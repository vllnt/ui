"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Options for {@link useControllableState}.
 */
export type UseControllableStateOptions<T> = {
  /** Initial value (or lazy initializer) used while uncontrolled. */
  defaultValue: (() => T) | T;
  /** Fires with the next value on every change request, controlled or not. */
  onChange?: (next: T) => void;
  /** Controlled value. Any non-`undefined` value makes the state controlled. */
  value?: T;
};

/**
 * Manages the controlled / uncontrolled state duality behind a single setter.
 *
 * A non-`undefined` `value` makes the state controlled; the internal value
 * updates while uncontrolled. `onChange` always fires with the requested
 * next value so controlled parents can mirror the change. The returned
 * setter keeps a stable identity across `onChange` re-creations.
 *
 * @param options - Controlled value, uncontrolled default, change callback
 * @returns Tuple of the resolved value and a stable setter
 * @example
 * const [open, setOpen] = useControllableState({
 *   value: controlledOpen,
 *   defaultValue: false,
 *   onChange: onOpenChange,
 * });
 */
export function useControllableState<T>({
  defaultValue,
  onChange,
  value,
}: UseControllableStateOptions<T>): readonly [T, (next: T) => void] {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const resolvedValue = isControlled ? value : internalValue;

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  return [resolvedValue, setValue];
}
