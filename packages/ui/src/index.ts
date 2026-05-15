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
  type SupportedLanguage,
  type SupportedLanguage as UISupportedLanguage,
} from "./lib/types";
export { useDebounce } from "./lib/use-debounce";
export {
  useDocumentEventListener,
  useEventCallback,
  useWindowEventListener,
} from "./lib/use-event-callback";
export { useHorizontalScroll } from "./lib/use-horizontal-scroll";
export { useMounted } from "./lib/use-mounted";
export {
  useControllableState,
  useUncontrolledState,
} from "./lib/use-uncontrolled-state";
export { cn } from "./lib/utils";
