// Shared types for components
export type SupportedLanguage = "en" | "fr";

export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: "EN",
  fr: "FR",
} as const;

export function getOtherLanguage(lang: SupportedLanguage): SupportedLanguage {
  return lang === "en" ? "fr" : "en";
}
