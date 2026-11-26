"use client";

import { usePlatformAllowsGlass } from "../theme/glass-availability";
import { useGlassEnabled } from "../theme/theme-provider";

import { glassRenderer } from "./glass-peers";

/**
 * Whether a glass surface may draw glass now. Returns `false` while Reduce
 * Transparency, Increase Contrast (iOS) or High Text Contrast (Android) is on,
 * while `ThemeProvider` sets `glass={false}`, and when neither
 * `expo-glass-effect` nor `expo-blur` is present. It stays `false` until the
 * platform reports the three preferences, and outside a `ThemeProvider`.
 *
 * It reads the one app-wide subscription that `ThemeProvider` holds, so each
 * extra surface adds no listeners, and it flips live when a preference
 * changes.
 *
 * @returns `true` when glass may render.
 */
function useGlassAvailability(): boolean {
  const glassEnabled = useGlassEnabled();
  const platformAllowsGlass = usePlatformAllowsGlass();

  return glassEnabled && platformAllowsGlass && glassRenderer().kind !== "none";
}

export { useGlassAvailability };
