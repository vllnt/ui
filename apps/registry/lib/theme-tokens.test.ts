import { describe, expect, it } from "vitest";

import { designTokens } from "@/lib/design-guide";
import { DEFAULT_THEME } from "@/lib/theme-tokens";

function semanticColors(mode: "dark" | "light"): Record<string, string> {
  return Object.fromEntries(
    Object.values(designTokens.color.semantic).map((color) => [
      color.cssVariable.slice(2),
      color[mode],
    ]),
  );
}

describe("DEFAULT_THEME", () => {
  it("mirrors the semantic colors in packages/design/tokens.json", () => {
    expect(DEFAULT_THEME.light).toEqual(semanticColors("light"));
    expect(DEFAULT_THEME.dark).toEqual(semanticColors("dark"));
  });
});
