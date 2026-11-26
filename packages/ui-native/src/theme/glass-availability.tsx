"use client";

import { createContext, type ReactNode, use, useEffect, useState } from "react";

import { AccessibilityInfo } from "react-native";

/** One platform preference that turns glass off when enabled. */
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

/** Props for {@link GlassAvailabilityProvider}. */
export type GlassAvailabilityProviderProps = {
  readonly children: ReactNode;
  /**
   * Source of the platform preferences. Tests inject a fake; the default reads
   * `AccessibilityInfo`. A provider with a `service` always subscribes to it,
   * even inside another provider.
   */
  readonly service?: GlassAccessibilityService;
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
 * Whether the platform preferences allow glass, or `undefined` outside a
 * provider.
 */
const PlatformAllowsGlassContext = createContext<boolean | undefined>(
  undefined,
);

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

type GlassPreferenceSubscriberProps = {
  readonly children: ReactNode;
  readonly service: GlassAccessibilityService;
};

/** Holds the one set of platform listeners and shares what they report. */
function GlassPreferenceSubscriber({
  children,
  service,
}: GlassPreferenceSubscriberProps) {
  const reduceTransparency = useGlassPreference(service.reduceTransparency);
  const darkerSystemColors = useGlassPreference(service.darkerSystemColors);
  const highTextContrast = useGlassPreference(service.highTextContrast);
  const allowed =
    !reduceTransparency && !darkerSystemColors && !highTextContrast;

  return (
    <PlatformAllowsGlassContext value={allowed}>
      {children}
    </PlatformAllowsGlassContext>
  );
}
GlassPreferenceSubscriber.displayName = "GlassPreferenceSubscriber";

/**
 * Subscribes to Reduce Transparency, Increase Contrast (iOS) and High Text
 * Contrast (Android) once and shares the result with every glass surface
 * below it, so a screen of any size holds three listeners. `ThemeProvider`
 * renders one, so an app gets it from its theme boundary. A provider inside
 * another one, such as a nested `ThemeProvider`, reuses the outer
 * subscription unless it receives its own `service`.
 */
function GlassAvailabilityProvider({
  children,
  service,
}: GlassAvailabilityProviderProps) {
  const outer = use(PlatformAllowsGlassContext);
  if (outer !== undefined && service === undefined) return children;

  return (
    <GlassPreferenceSubscriber
      service={service ?? defaultGlassAccessibilityService}
    >
      {children}
    </GlassPreferenceSubscriber>
  );
}
GlassAvailabilityProvider.displayName = "GlassAvailabilityProvider";

/**
 * Whether the platform preferences allow glass now. Returns `false` outside a
 * {@link GlassAvailabilityProvider}, so a surface rendered on its own stays
 * solid, and until the platform has answered all three preferences.
 *
 * @returns `true` once every preference has answered and none is on.
 */
function usePlatformAllowsGlass(): boolean {
  return use(PlatformAllowsGlassContext) ?? false;
}

export {
  defaultGlassAccessibilityService,
  GlassAvailabilityProvider,
  usePlatformAllowsGlass,
};
