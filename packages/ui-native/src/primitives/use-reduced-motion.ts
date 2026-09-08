"use client";

import { useEffect, useState } from "react";

import { AccessibilityInfo } from "react-native";

/** Minimal injectable contract for observing the native reduced-motion setting. */
export type ReducedMotionService = {
  readonly addEventListener: (
    eventName: "reduceMotionChanged",
    listener: (reducedMotionEnabled: boolean) => void,
  ) => { readonly remove: () => void };
  readonly isReduceMotionEnabled: () => Promise<boolean>;
};

const defaultReducedMotionService: ReducedMotionService = {
  addEventListener(eventName, listener) {
    return AccessibilityInfo.addEventListener(eventName, listener);
  },
  isReduceMotionEnabled() {
    return AccessibilityInfo.isReduceMotionEnabled();
  },
};

/**
 * Observes the platform reduced-motion preference and removes the native
 * subscription on unmount. The initial value is conservative until queried.
 */
function useReducedMotion(
  service: ReducedMotionService = defaultReducedMotionService,
): boolean {
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(true);

  useEffect(() => {
    let mounted = true;
    let preferenceChanged = false;
    const subscription = service.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        preferenceChanged = true;
        if (mounted) setReducedMotionEnabled(enabled);
      },
    );

    void service.isReduceMotionEnabled().then(
      (enabled) => {
        if (mounted && !preferenceChanged) setReducedMotionEnabled(enabled);
      },
      (error: unknown) => {
        void error;
      },
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [service]);

  return reducedMotionEnabled;
}

export { defaultReducedMotionService, useReducedMotion };
