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
  | "aura"
  | "chatgpt"
  | "claude"
  | "cyberlime"
  | "cyberpunk"
  | "default"
  | "dracula"
  | "dusk"
  | "gemini"
  | "matrix"
  | "nord"
  | "synthwave"
  | "tron";

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
  { label: "Matrix", name: "matrix", swatch: "oklch(0.8 0.24 150)" },
  { label: "Dracula", name: "dracula", swatch: "oklch(0.72 0.16 300)" },
  { label: "Synthwave", name: "synthwave", swatch: "oklch(0.68 0.26 350)" },
  { label: "Tron", name: "tron", swatch: "oklch(0.78 0.15 215)" },
  { label: "Cyberpunk", name: "cyberpunk", swatch: "oklch(0.86 0.19 100)" },
  { label: "Nord", name: "nord", swatch: "oklch(0.72 0.08 230)" },
  { label: "Claude", name: "claude", swatch: "oklch(0.66 0.11 45)" },
  { label: "ChatGPT", name: "chatgpt", swatch: "oklch(0.68 0.12 168)" },
  { label: "Gemini", name: "gemini", swatch: "oklch(0.62 0.17 280)" },
  { label: "Future Dusk", name: "dusk", swatch: "oklch(0.62 0.13 290)" },
  { label: "Cyber Lime", name: "cyberlime", swatch: "oklch(0.88 0.22 128)" },
  { label: "Aura", name: "aura", swatch: "oklch(0.66 0.26 350)" },
];

export const DEFAULT_THEME_PRESET: ThemePresetName = "default";

/** Narrowing guard for an arbitrary string to a known preset name. */
export function isThemePresetName(value: string): value is ThemePresetName {
  return THEME_PRESETS.some((preset) => preset.name === value);
}
