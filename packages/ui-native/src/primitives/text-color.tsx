import { createContext } from "react";

import type { NativeTheme, TextTone } from "@vllnt/ui-core";

/**
 * Default foreground for package `Text` rendered inside a filled surface
 * (for example a destructive banner or a primary floating action button).
 * React Native does not inherit text color across Views, so filled
 * containers provide their paired foreground token here.
 */
const TextColorContext = createContext<string | undefined>(undefined);

/**
 * Color for text, or for a glyph that sits beside text, at `tone`. The
 * paired foreground of a filled surface (`surfaceColor`) wins over the tone.
 */
function resolveTextColor(
  theme: NativeTheme,
  tone: TextTone,
  surfaceColor: string | undefined,
): string {
  return (
    surfaceColor ??
    (tone === "muted" ? theme.colors.mutedForeground : theme.colors.foreground)
  );
}

export { resolveTextColor, TextColorContext };
