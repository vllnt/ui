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

const ThemeContext = createContext<NativeTheme>(lightTheme);

/** Color selection accepted by {@link ThemeProvider}. */
export type ThemeSelection = "system" | ThemeColorScheme;

/** Props for the native VLLNT UI theme boundary. */
export type ThemeProviderProps = {
  readonly children: ReactNode;
  readonly colorScheme?: ThemeSelection;
  readonly override?: NativeThemeOverride;
};

/** Supplies generated semantic tokens to every native component below it. */
function ThemeProvider({
  children,
  colorScheme = "system",
  override,
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
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

  return <ThemeContext value={theme}>{children}</ThemeContext>;
}
ThemeProvider.displayName = "ThemeProvider";

/** Reads the nearest VLLNT UI native theme, defaulting to the light theme. */
function useTheme(): NativeTheme {
  return use(ThemeContext);
}

export { ThemeProvider, useTheme };
