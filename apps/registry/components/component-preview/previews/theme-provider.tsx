"use client";

import { ThemeProvider } from "@vllnt/ui";

export default function ThemeProviderPreview() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm">
          Theme Provider wraps your app for theme support.
        </p>
      </div>
    </ThemeProvider>
  );
}
