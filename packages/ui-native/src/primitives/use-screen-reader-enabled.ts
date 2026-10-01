"use client";

import { useEffect, useState } from "react";

import { AccessibilityInfo } from "react-native";

/**
 * Observes whether VoiceOver or TalkBack is running. Starts as `false` until
 * the platform answers, so callers must react when it later turns `true`.
 */
function useScreenReaderEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      (value: boolean) => {
        changed = true;
        if (mounted) setEnabled(value);
      },
    );
    void AccessibilityInfo.isScreenReaderEnabled().then(
      (value) => {
        if (mounted && !changed) setEnabled(value);
      },
      (error: unknown) => {
        void error;
      },
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return enabled;
}

export { useScreenReaderEnabled };
