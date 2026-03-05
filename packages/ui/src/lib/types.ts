// Shared types for components
export type SupportedLanguage = "en" | "fr";

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: "EN",
  fr: "FR",
} as const;

export function getOtherLanguage(lang: SupportedLanguage): SupportedLanguage {
  return lang === "en" ? "fr" : "en";
}
