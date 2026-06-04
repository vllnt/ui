"use client";

import { useEffect } from "react";

import { usePathname } from "next/navigation";

import type { SupportedLanguage } from "@vllnt/ui";

type LangProviderProps = {
  defaultLanguage?: SupportedLanguage;
  supportedLanguages?: SupportedLanguage[];
};

export function LangProvider({
  defaultLanguage = "en",
  supportedLanguages = ["en", "fr"],
}: LangProviderProps) {
  const pathname = usePathname();

  // Derive the language during render from the pathname.
  // Matches /en, /fr, /en/, /fr/, etc.
  const langMatch = /^\/([a-z]{2})(?:\/|$)/.exec(pathname);
  const lang =
    langMatch && supportedLanguages.includes(langMatch[1] as SupportedLanguage)
      ? (langMatch[1] as SupportedLanguage)
      : defaultLanguage;

  useEffect(() => {
    // Sync the derived language to the document's lang attribute.
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  return null;
}
