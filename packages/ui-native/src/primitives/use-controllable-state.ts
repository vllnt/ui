"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

/** Change callback shared by controlled and uncontrolled state. */
export type ControllableStateChangeHandler<TValue> = (value: TValue) => void;

/** Stable setter returned by {@link useControllableState}. */
export type ControllableStateSetter<TValue> = (value: TValue) => void;

/** Explicit controlled and uncontrolled configurations for reusable primitives. */
export type ControllableStateOptions<TValue> =
  | {
      readonly defaultValue: TValue;
      readonly mode: "uncontrolled";
      readonly onChange?: ControllableStateChangeHandler<TValue>;
    }
  | {
      readonly mode: "controlled";
      readonly onChange?: ControllableStateChangeHandler<TValue>;
      readonly value: TValue;
    };

/** Current value and a setter whose identity remains stable across renders. */
export type ControllableStateResult<TValue> = readonly [
  value: TValue,
  setValue: ControllableStateSetter<TValue>,
];

/**
 * Manages explicitly controlled or uncontrolled state without duplicate change
 * notifications for values equal under `Object.is`.
 */
function useControllableState<TValue>(
  options: ControllableStateOptions<TValue>,
): ControllableStateResult<TValue> {
  const initialValue =
    options.mode === "controlled" ? options.value : options.defaultValue;
  const [uncontrolledValue, setUncontrolledValue] = useState(initialValue);
  const controlled = options.mode === "controlled";
  const value = controlled ? options.value : uncontrolledValue;
  const controlledRef = useRef(controlled);
  const onChangeRef = useRef(options.onChange);
  const valueRef = useRef(value);

  useLayoutEffect(() => {
    controlledRef.current = controlled;
    onChangeRef.current = options.onChange;
    valueRef.current = value;
  }, [controlled, options.onChange, value]);

  const setValue = useCallback((nextValue: TValue) => {
    if (Object.is(valueRef.current, nextValue)) return;

    if (!controlledRef.current) {
      valueRef.current = nextValue;
      setUncontrolledValue(nextValue);
    }
    onChangeRef.current?.(nextValue);
  }, []);

  return [value, setValue];
}

export { useControllableState };
