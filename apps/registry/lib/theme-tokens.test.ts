import { describe, expect, it } from "vitest";

import { designTokens } from "@/lib/design-guide";
import { DEFAULT_THEME, THEME_TOKENS } from "@/lib/theme-tokens";

const EDITABLE_VARIABLES = new Set(THEME_TOKENS.map((token) => token.cssVar));

/**
 * The editor edits the shadcn role set only. Adding a role to THEME_TOKENS
 * changes the positional share-link format, so the status and diff roles in
 * tokens.json (success, warning, info, diffAdded, diffRemoved) stay out of it.
 */
function editableSemanticColors(mode: "dark" | "light"): Record<string, string> {
  return Object.fromEntries(
    Object.values(designTokens.color.semantic)
      .filter((color) => EDITABLE_VARIABLES.has(color.cssVariable))
      .map((color) => [color.cssVariable.slice(2), color[mode]]),
  );
}

describe("DEFAULT_THEME", () => {
  it("mirrors the editable semantic colors in packages/design/tokens.json", () => {
    expect(DEFAULT_THEME.light).toEqual(editableSemanticColors("light"));
    expect(DEFAULT_THEME.dark).toEqual(editableSemanticColors("dark"));
  });

  it("covers every editable role in tokens.json", () => {
    expect(Object.keys(editableSemanticColors("light")).sort()).toEqual(
      THEME_TOKENS.map((token) => token.name).sort(),
    );
  });
});
