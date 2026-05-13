"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type EventListenerOptions = AddEventListenerOptions | boolean;

export function useEventCallback<TArguments extends unknown[], TReturnValue>(
  callback: (...arguments_: TArguments) => TReturnValue,
): (...arguments_: TArguments) => TReturnValue {
  const callbackRef = useRef(callback);

  useIsomorphicLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...arguments_: TArguments) => {
    return callbackRef.current(...arguments_);
  }, []);
}

export function useDocumentEventListener<TKey extends keyof DocumentEventMap>(
  type: TKey,
  listener: (event: DocumentEventMap[TKey]) => void,
  options?: EventListenerOptions,
): void {
  const listenerRef = useRef(listener);

  useIsomorphicLayoutEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleEvent = (event: DocumentEventMap[TKey]): void => {
      listenerRef.current(event);
    };

    document.addEventListener(type, handleEvent, options);
    return () => {
      document.removeEventListener(type, handleEvent, options);
    };
  }, [options, type]);
}

type WindowEventListenerOptions = {
  enabled?: boolean;
  options?: EventListenerOptions;
};

export function useWindowEventListener<TKey extends keyof WindowEventMap>(
  type: TKey,
  listener: (event: WindowEventMap[TKey]) => void,
  { enabled = true, options }: WindowEventListenerOptions = {},
): void {
  const listenerRef = useRef(listener);

  useIsomorphicLayoutEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleEvent = (event: WindowEventMap[TKey]): void => {
      listenerRef.current(event);
    };

    window.addEventListener(type, handleEvent, options);
    return () => {
      window.removeEventListener(type, handleEvent, options);
    };
  }, [enabled, options, type]);
}
