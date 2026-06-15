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
  formatChange,
  getCurrencyFormatter,
  getDateTimeFormatter,
  getNumberFormatter,
} from "./lib/format";
export {
  getOtherLanguage,
  type HeadingTag,
  LANGUAGE_NAMES,
  type SupportedLanguage,
  type SupportedLanguage as UISupportedLanguage,
} from "./lib/types";
export {
  DEFAULT_THEME_PRESET,
  isThemePresetName,
  THEME_PRESET_STORAGE_KEY,
  THEME_PRESETS,
  type ThemePreset,
  type ThemePresetName,
} from "./lib/theme-presets";
export { useBodyScrollLock } from "./lib/use-body-scroll-lock";
export {
  useControllableState,
  type UseControllableStateOptions,
} from "./lib/use-controllable-state";
export { useDebounce } from "./lib/use-debounce";
export {
  useDocumentKeyDown,
  type UseDocumentKeyDownOptions,
  useEscapeKey,
  type UseEscapeKeyOptions,
} from "./lib/use-document-key-down";
export { useHorizontalScroll } from "./lib/use-horizontal-scroll";
export { useMounted } from "./lib/use-mounted";
export { normalizeDate, useNow, type UseNowOptions } from "./lib/use-now";
export {
  type CustomTheme,
  setCustomTheme,
  setThemePreset,
  useThemePreset,
  type UseThemePresetResult,
} from "./lib/use-theme-preset";
export { cn } from "./lib/utils";
