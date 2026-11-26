"use client";

import { useState } from "react";

import { useEventCallback } from "./use-event-callback";

/** Options for {@link useControllableState}. */
export type ControllableStateOptions<T> = {
  /** The value of an uncontrolled state at first. */
  defaultValue: T;
  /** Called with the next value when it differs from the current one. */
  onChange?: (value: T) => void;
  /**
   * The value of a controlled state. Left `undefined` the hook holds the state
   * itself; `null` is a value, so a controlled `null` stays controlled.
   */
  value?: T;
};

/**
 * One owner for a value that is either controlled by a `value` prop or held
 * by the component, as `defaultValue` + `onValueChange` pairs are. Returns the
 * current value and a stable setter. The setter updates the state it holds
 * (uncontrolled state) and calls `onChange`, skipping a value equal to the
 * current one (`Object.is`).
 *
 * @example
 * const [open, setOpen] = useControllableState({
 *   defaultValue: defaultOpen,
 *   onChange: onOpenChange,
 *   value: openProp,
 * });
 */
export function useControllableState<T>({
  defaultValue,
  onChange,
  value,
}: ControllableStateOptions<T>): readonly [T, (next: T) => void] {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const setValue = useEventCallback((next: T) => {
    if (Object.is(next, current)) {
      return;
    }
    if (!controlled) {
      setInternal(next);
    }
    onChange?.(next);
  });

  return [current, setValue] as const;
}
