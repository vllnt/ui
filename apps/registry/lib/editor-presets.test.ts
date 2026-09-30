import { THEME_PRESETS } from "@vllnt/ui";
import { describe, expect, it } from "vitest";

import { loadEditorPresets, parsePresetPalettes } from "@/lib/editor-presets";
import {
  DEFAULT_RADIUS,
  DEFAULT_THEME,
  THEME_TOKENS,
} from "@/lib/theme-tokens";

const CSS = `
/* comment */
html[data-theme="demo"] {
  --foreground: 0.2 0.1 150;
  --background: 0.97 0.03 150;
  --radius: 0.75rem;
}

html[data-theme="demo"].dark {
  --background: 0.14 0.025 150;
  --foreground: 0.88 0.21 150;
}

html[data-theme="no-radius"] {
  --background: 1 0 0;
}
`;

describe("parsePresetPalettes", () => {
  it("splits light/dark blocks and lifts --radius out of the colors", () => {
    expect(parsePresetPalettes(CSS).get("demo")).toEqual({
      dark: { background: "0.14 0.025 150", foreground: "0.88 0.21 150" },
      light: { background: "0.97 0.03 150", foreground: "0.2 0.1 150" },
      radius: "0.75rem",
    });
  });

  it("sorts color keys and defaults a missing radius and mode", () => {
    const demo = parsePresetPalettes(CSS).get("demo");
    expect(Object.keys(demo?.light ?? {})).toEqual([
      "background",
      "foreground",
    ]);
    expect(parsePresetPalettes(CSS).get("no-radius")).toEqual({
      dark: {},
      light: { background: "1 0 0" },
      radius: DEFAULT_RADIUS,
    });
  });

  it("returns no palettes for CSS without preset blocks", () => {
    expect(parsePresetPalettes(":root { --background: 1 0 0; }").size).toBe(0);
  });
});

describe("loadEditorPresets", () => {
  it("pairs every THEME_PRESETS entry with a complete palette from presets.css", async () => {
    const presets = await loadEditorPresets();
    expect(
      presets.map(({ label, name, swatch }) => ({ label, name, swatch })),
    ).toEqual(THEME_PRESETS);
    expect(presets[0]?.theme).toBe(DEFAULT_THEME);
    const tokens = THEME_TOKENS.map((token) => token.name).sort();
    const tokenSets = presets.flatMap(({ theme }) => [
      Object.keys(theme.light).sort(),
      Object.keys(theme.dark).sort(),
    ]);
    expect(tokenSets).toEqual(tokenSets.map(() => tokens));
  });
});
