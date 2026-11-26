"use client";

import { useEffect, useState } from "react";

import { AccessibilityInfo } from "react-native";

import { useGlassEnabled } from "../theme/theme-provider";

import { glassRenderer } from "./glass-peers";

/** One platform preference that turns glass off while it is on. */
export type GlassPreference = {
  readonly addListener: (listener: (enabled: boolean) => void) => {
    readonly remove: () => void;
  };
  readonly isEnabled: () => Promise<boolean>;
};

/**
 * Injectable contract for the platform preferences that turn glass off. React
 * Native reports each on one platform and answers `false` on the other.
 */
export type GlassAccessibilityService = {
  /** Increase Contrast on iOS. */
  readonly darkerSystemColors: GlassPreference;
  /** High Text Contrast on Android. */
  readonly highTextContrast: GlassPreference;
  /** Reduce Transparency on iOS. */
  readonly reduceTransparency: GlassPreference;
};

const defaultGlassAccessibilityService: GlassAccessibilityService = {
  darkerSystemColors: {
    addListener(listener) {
      return AccessibilityInfo.addEventListener(
        "darkerSystemColorsChanged",
        listener,
      );
    },
    isEnabled() {
      return AccessibilityInfo.isDarkerSystemColorsEnabled();
    },
  },
  highTextContrast: {
    addListener(listener) {
      return AccessibilityInfo.addEventListener(
        "highTextContrastChanged",
        listener,
      );
    },
    isEnabled() {
      return AccessibilityInfo.isHighTextContrastEnabled();
    },
  },
  reduceTransparency: {
    addListener(listener) {
      return AccessibilityInfo.addEventListener(
        "reduceTransparencyChanged",
        listener,
      );
    },
    isEnabled() {
      return AccessibilityInfo.isReduceTransparencyEnabled();
    },
  },
};

/**
 * Observes one preference and removes the native subscription on unmount. The
 * value stays `true` until the platform answers, so glass never shows to a
 * user who may have turned it off.
 */
function useGlassPreference(preference: GlassPreference): boolean {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let mounted = true;
    let changed = false;
    const subscription = preference.addListener((value) => {
      changed = true;
      if (mounted) setEnabled(value);
    });

    void preference.isEnabled().then(
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
  }, [preference]);

  return enabled;
}

/**
 * Whether a glass surface may draw glass now. It is `false` while Reduce
 * Transparency, Increase Contrast (iOS) or High Text Contrast (Android) is on,
 * while `ThemeProvider` sets `glass={false}`, and when neither
 * `expo-glass-effect` nor `expo-blur` is present. It also stays `false` until
 * the platform reports the three preferences, and it flips live when one
 * changes.
 *
 * @param service Preference source; tests inject a fake.
 * @returns `true` when glass may render.
 */
function useGlassAvailability(
  service: GlassAccessibilityService = defaultGlassAccessibilityService,
): boolean {
  const glassEnabled = useGlassEnabled();
  const reduceTransparency = useGlassPreference(service.reduceTransparency);
  const darkerSystemColors = useGlassPreference(service.darkerSystemColors);
  const highTextContrast = useGlassPreference(service.highTextContrast);

  return (
    glassEnabled &&
    glassRenderer().kind !== "none" &&
    !reduceTransparency &&
    !darkerSystemColors &&
    !highTextContrast
  );
}

export { defaultGlassAccessibilityService, useGlassAvailability };
