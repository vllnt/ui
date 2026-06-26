// Re-export all components from components/index.ts
export * from "./components";

// Re-export generic content types
export type {
  Content,
  ContentMeta,
  ContentProgress,
  ContentSection,
  ContentSectionMinimal,
  DifficultyLevel,
} from "./types";

// Re-export lib utilities
export {
  getOtherLanguage,
  type HeadingTag,
  LANGUAGE_NAMES,
  type SupportedLanguage,
  type SupportedLanguage as UISupportedLanguage,
} from "./lib/types";
export {
  CUSTOM_THEME_NAME,
  DEFAULT_THEME_PRESET,
  isThemePresetName,
  THEME_CUSTOM_CSS_STORAGE_KEY,
  THEME_CUSTOM_STYLE_ID,
  THEME_PRESET_STORAGE_KEY,
  THEME_PRESETS,
  type ThemePreset,
  type ThemePresetName,
} from "./lib/theme-presets";
export { formatChange, normalizeDate } from "./lib/format";
export { useBodyScrollLock } from "./lib/use-body-scroll-lock";
export { useDebounce } from "./lib/use-debounce";
export { useEscapeKey } from "./lib/use-escape-key";
export { useHorizontalScroll } from "./lib/use-horizontal-scroll";
export { useLiveDate } from "./lib/use-live-date";
export { useMounted } from "./lib/use-mounted";
export {
  type CustomTheme,
  setCustomTheme,
  setThemePreset,
  useThemePreset,
  type UseThemePresetResult,
} from "./lib/use-theme-preset";
export { cn } from "./lib/utils";
