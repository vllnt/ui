/**
 * Built-in full themes for the runtime theming system. Set `data-theme="<name>"`
 * on the document root to activate a preset; the matching rules live in
 * `@vllnt/ui/themes/presets.css`. Each preset is a complete token set, so
 * switching transforms the whole UI. The `default` preset uses the base
 * `:root` / `.dark` tokens and sets no `data-theme` attribute.
 */

/** localStorage key used to persist the active preset across reloads. */
export const THEME_PRESET_STORAGE_KEY = "vllnt-theme-preset";

/** `data-theme` value used by a user-authored custom theme. */
export const CUSTOM_THEME_NAME = "custom";

/** localStorage key holding the compiled CSS of a custom theme. */
export const THEME_CUSTOM_CSS_STORAGE_KEY = "vllnt-theme-custom-css";

/** Element id of the injected custom-theme stylesheet. */
export const THEME_CUSTOM_STYLE_ID = "vllnt-theme-custom-style";

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
  { label: "Blue", name: "blue", swatch: "oklch(0.55 0.17 264)" },
  { label: "Green", name: "green", swatch: "oklch(0.55 0.17 155)" },
  { label: "Amber", name: "amber", swatch: "oklch(0.55 0.17 70)" },
  { label: "Rose", name: "rose", swatch: "oklch(0.55 0.17 12)" },
  { label: "Violet", name: "violet", swatch: "oklch(0.55 0.17 300)" },
];

export const DEFAULT_THEME_PRESET: ThemePresetName = "default";

/** Narrowing guard for an arbitrary string to a known preset name. */
export function isThemePresetName(value: string): value is ThemePresetName {
  return THEME_PRESETS.some((preset) => preset.name === value);
}
