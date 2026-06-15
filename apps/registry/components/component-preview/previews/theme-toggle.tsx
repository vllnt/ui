"use client";

import { ThemeToggle, Toggle } from "@vllnt/ui";

export default function ThemeTogglePreview() {
  return (
    <ThemeToggle
      dict={{
        theme: {
          dark: "Dark",
          light: "Light",
          system: "System",
          toggle_theme: "Toggle theme",
        },
      }}
    />
  );
}
