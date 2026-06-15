"use client";

import { LangProvider } from "@vllnt/ui";

export default function LangProviderPreview() {
  return (
    <div className="space-y-2">
      <LangProvider defaultLanguage="en" supportedLanguages={["en", "fr"]} />
      <p className="text-sm text-muted-foreground">
        Sets the HTML lang attribute.
      </p>
    </div>
  );
}
