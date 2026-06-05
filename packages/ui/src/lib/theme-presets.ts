/**
 * Built-in theme presets for the runtime theming system. Set
 * `data-theme="<name>"` on the document root to activate a preset; the matching
 * rules live in `@vllnt/ui/themes/presets.css`. The `default` preset uses the
 * base `:root` / `.dark` tokens and sets no `data-theme` attribute.
 */

/** localStorage key used to persist the active preset across reloads. */
export const THEME_PRESET_STORAGE_KEY = "vllnt-theme-preset";

export type ThemePresetName =
  | "amber"
  | "blue"
  | "default"
  | "green"
  | "rose"
  | "violet";

export type ThemePreset = {
  /** Human-readable label for switcher UIs. */
  readonly label: string;
  /** Stable identifier, also the `data-theme` attribute value. */
  readonly name: ThemePresetName;
  /** Representative CSS color used for swatch previews. */
  readonly swatch: string;
};

export const THEME_PRESETS: readonly ThemePreset[] = [
  { label: "Default", name: "default", swatch: "oklch(0.2044 0 0)" },
  { label: "Blue", name: "blue", swatch: "oklch(0.546 0.245 262.881)" },
  { label: "Green", name: "green", swatch: "oklch(0.723 0.219 149.579)" },
  { label: "Amber", name: "amber", swatch: "oklch(0.705 0.213 47.604)" },
  { label: "Rose", name: "rose", swatch: "oklch(0.645 0.246 16.439)" },
  { label: "Violet", name: "violet", swatch: "oklch(0.606 0.25 292.717)" },
];

export const DEFAULT_THEME_PRESET: ThemePresetName = "default";

/** Narrowing guard for an arbitrary string to a known preset name. */
export function isThemePresetName(value: string): value is ThemePresetName {
  return THEME_PRESETS.some((preset) => preset.name === value);
}
