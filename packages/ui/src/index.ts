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
export type { Material, MaterialProps } from "./lib/material";
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
export { createCommandRanker } from "./lib/command-rank";
export { commandScore } from "./lib/command-score";
export { copyText } from "./lib/copy-text";
export { formatChange, normalizeDate } from "./lib/format";
export {
  isStatusTone,
  STATUS_TONES,
  statusDotVariants,
  type StatusTone,
} from "./lib/status-dot";
export { keyByOccurrence } from "./lib/occurrence-keys";
export {
  moveRovingFocus,
  type RovingFocusOptions,
  type RovingOrientation,
} from "./lib/roving-focus";
// ui-sdk compat helpers: the Radix-shaped API (asChild, data-state, focus and
// dismissal callbacks) that the kit's components build on ui-sdk parts with.
export {
  type AsChildProps,
  asChildProps,
  checkedState,
  closeAutoFocus,
  type DataAttributes,
  type NarrowPartProps,
  openAutoFocus,
  openState,
  Slot,
  useElementRef,
  withDataAttributes,
} from "./lib/ui-sdk";
export {
  callPreventDefault,
  DismissContext,
  type DismissDetails,
  type DismissHandlers,
  type FocusOutsideEvent,
  type PointerDownOutsideEvent,
  runDismissHandlers,
  useDismissRoot,
  useRegisterDismissHandlers,
} from "./lib/ui-sdk-dismiss";
export {
  createMenuParts,
  MenuContentContext,
  type MenuContentProps,
  type MenuLook,
  useMenuContentOptions,
} from "./lib/ui-sdk-menu";
export { useBodyScrollLock } from "./lib/use-body-scroll-lock";
export { useDebounce } from "./lib/use-debounce";
export { useEscapeKey } from "./lib/use-escape-key";
export { useEventCallback } from "./lib/use-event-callback";
export { useFocusContainment } from "./lib/use-focus-containment";
export { useHorizontalScroll } from "./lib/use-horizontal-scroll";
export { useLiveDate } from "./lib/use-live-date";
export { useMounted } from "./lib/use-mounted";
export {
  type ReturnFocusHandlers,
  useReturnFocus,
} from "./lib/use-return-focus";
export {
  type CustomTheme,
  setCustomTheme,
  setThemePreset,
  useThemePreset,
  type UseThemePresetResult,
} from "./lib/use-theme-preset";
export { cn } from "./lib/utils";
