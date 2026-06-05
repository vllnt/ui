/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Starting-point themes for the editor. Brand-token overrides mirror the
 * built-in runtime presets in `@vllnt/ui/themes/presets.css`; everything else
 * inherits the default neutral tokens.
 */

import { DEFAULT_THEME, type ThemeColors, type ThemeData } from "./theme-tokens";

interface PresetOverride {
  readonly light: ThemeColors;
  readonly dark: ThemeColors;
}

export interface EditorPreset {
  readonly name: string;
  readonly label: string;
  readonly swatch: string;
  readonly theme: ThemeData;
}

const OVERRIDES = {
  blue: {
    light: {
      primary: "0.546 0.245 262.881",
      "primary-foreground": "0.97 0.014 254.604",
      ring: "0.546 0.245 262.881",
    },
    dark: {
      primary: "0.623 0.214 259.815",
      "primary-foreground": "0.97 0.014 254.604",
      ring: "0.623 0.214 259.815",
    },
  },
  green: {
    light: {
      primary: "0.723 0.219 149.579",
      "primary-foreground": "0.982 0.018 155.826",
      ring: "0.723 0.219 149.579",
    },
    dark: {
      primary: "0.696 0.17 162.48",
      "primary-foreground": "0.393 0.095 152.535",
      ring: "0.527 0.154 150.069",
    },
  },
  amber: {
    light: {
      primary: "0.705 0.213 47.604",
      "primary-foreground": "0.98 0.016 73.684",
      ring: "0.705 0.213 47.604",
    },
    dark: {
      primary: "0.646 0.222 41.116",
      "primary-foreground": "0.98 0.016 73.684",
      ring: "0.646 0.222 41.116",
    },
  },
  rose: {
    light: {
      primary: "0.645 0.246 16.439",
      "primary-foreground": "0.969 0.015 12.422",
      ring: "0.645 0.246 16.439",
    },
    dark: {
      primary: "0.645 0.246 16.439",
      "primary-foreground": "0.969 0.015 12.422",
      ring: "0.645 0.246 16.439",
    },
  },
  violet: {
    light: {
      primary: "0.606 0.25 292.717",
      "primary-foreground": "0.969 0.016 293.756",
      ring: "0.606 0.25 292.717",
    },
    dark: {
      primary: "0.541 0.281 293.009",
      "primary-foreground": "0.969 0.016 293.756",
      ring: "0.541 0.281 293.009",
    },
  },
} satisfies Record<string, PresetOverride>;

function buildTheme(override: PresetOverride): ThemeData {
  return {
    light: { ...DEFAULT_THEME.light, ...override.light },
    dark: { ...DEFAULT_THEME.dark, ...override.dark },
    radius: DEFAULT_THEME.radius,
  };
}

export const EDITOR_PRESETS: readonly EditorPreset[] = [
  { name: "default", label: "Default", swatch: "oklch(0.2044 0 0)", theme: DEFAULT_THEME },
  { name: "blue", label: "Blue", swatch: "oklch(0.546 0.245 262.881)", theme: buildTheme(OVERRIDES.blue) },
  { name: "green", label: "Green", swatch: "oklch(0.723 0.219 149.579)", theme: buildTheme(OVERRIDES.green) },
  { name: "amber", label: "Amber", swatch: "oklch(0.705 0.213 47.604)", theme: buildTheme(OVERRIDES.amber) },
  { name: "rose", label: "Rose", swatch: "oklch(0.645 0.246 16.439)", theme: buildTheme(OVERRIDES.rose) },
  { name: "violet", label: "Violet", swatch: "oklch(0.606 0.25 292.717)", theme: buildTheme(OVERRIDES.violet) },
];
