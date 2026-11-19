import { describe, expect, it } from "vitest";

import { designTokens } from "@/lib/design-guide";
import { DEFAULT_THEME, THEME_TOKENS } from "@/lib/theme-tokens";

const EDITABLE_VARIABLES = new Set(THEME_TOKENS.map((token) => token.cssVar));

const EDITABLE_ROLES = [
  "accent",
  "accent-foreground",
  "background",
  "border",
  "card",
  "card-foreground",
  "destructive",
  "destructive-foreground",
  "foreground",
  "input",
  "muted",
  "muted-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "ring",
  "secondary",
  "secondary-foreground",
];

const EXCLUDED_VARIABLES = [
  "--diff-added",
  "--diff-removed",
  "--info",
  "--info-foreground",
  "--success",
  "--success-foreground",
  "--warning",
  "--warning-foreground",
];

/**
 * The editor edits the shadcn role set. Adding a role to THEME_TOKENS changes
 * the positional share-link format, so the status and diff roles in tokens.json
 * stay out of it.
 */
function editableSemanticColors(
  mode: "dark" | "light",
): Record<string, string> {
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

  it("keeps the editable roles at the 19 shadcn roles", () => {
    expect(THEME_TOKENS.map((token) => token.name).sort()).toEqual(
      EDITABLE_ROLES,
    );
  });

  it("leaves out exactly the status and diff variables", () => {
    const excluded = Object.values(designTokens.color.semantic)
      .map((color) => color.cssVariable)
      .filter((cssVariable) => !EDITABLE_VARIABLES.has(cssVariable))
      .sort();
    expect(excluded).toEqual(EXCLUDED_VARIABLES);
  });
});
