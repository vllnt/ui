"use client";

import { createContext, type ReactNode, use, useMemo } from "react";

import {
  createNativeTheme,
  lightTheme,
  type NativeTheme,
  type NativeThemeOverride,
  type ThemeColorScheme,
} from "@vllnt/ui-core";
import { useColorScheme } from "react-native";

import { GlassAvailabilityProvider } from "./glass-availability";

const ThemeContext = createContext<NativeTheme>(lightTheme);
const GlassEnabledContext = createContext(true);

/** Color selection accepted by {@link ThemeProvider}. */
export type ThemeSelection = "system" | ThemeColorScheme;

/** Props for the native VLLNT UI theme boundary. */
export type ThemeProviderProps = {
  readonly children: ReactNode;
  readonly colorScheme?: ThemeSelection;
  /**
   * Global glass switch, the native twin of web `html[data-glass="off"]`.
   * `false` draws every glass surface below solid, whatever its `material`.
   * Leave it unset to follow the nearest outer provider, which defaults to
   * glass on.
   */
  readonly glass?: boolean;
  readonly override?: NativeThemeOverride;
};

/**
 * Supplies generated semantic tokens to every native component below it. It
 * also holds the app's one subscription to the platform preferences that turn
 * glass off; a nested provider reuses it.
 */
function ThemeProvider({
  children,
  colorScheme = "system",
  glass,
  override,
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const inheritedGlass = use(GlassEnabledContext);
  const resolvedColorScheme =
    colorScheme === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : colorScheme;
  const theme = useMemo(
    () => createNativeTheme(resolvedColorScheme, override),
    [override, resolvedColorScheme],
  );

  return (
    <GlassAvailabilityProvider>
      <GlassEnabledContext value={glass ?? inheritedGlass}>
        <ThemeContext value={theme}>{children}</ThemeContext>
      </GlassEnabledContext>
    </GlassAvailabilityProvider>
  );
}
ThemeProvider.displayName = "ThemeProvider";

/** Reads the nearest VLLNT UI native theme, defaulting to the light theme. */
function useTheme(): NativeTheme {
  return use(ThemeContext);
}

/** Reads the global glass switch set by `ThemeProvider`; `true` by default. */
function useGlassEnabled(): boolean {
  return use(GlassEnabledContext);
}

export { ThemeProvider, useGlassEnabled, useTheme };
