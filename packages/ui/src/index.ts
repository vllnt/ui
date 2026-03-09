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
  LANGUAGE_NAMES,
  type SupportedLanguage as UISupportedLanguage,
} from "./lib/types";
export { useDebounce } from "./lib/use-debounce";
export { useHorizontalScroll } from "./lib/use-horizontal-scroll";
export { cn } from "./lib/utils";
