import { readFile } from "node:fs/promises";
import path from "node:path";

import { THEME_PRESETS } from "@vllnt/ui";

import {
  DEFAULT_RADIUS,
  DEFAULT_THEME,
  type ThemeColors,
  type ThemeData,
} from "./theme-tokens";

/**
 * Named theme presets for the editor. Labels and swatches come from
 * `THEME_PRESETS`; each palette comes from `@vllnt/ui/themes/presets.css`, the
 * single source of the preset colors.
 */
export type EditorPreset = {
  readonly label: string;
  readonly name: string;
  readonly swatch: string;
  readonly theme: ThemeData;
};

const PRESETS_CSS_PATH = path.join(
  process.cwd(),
  "..",
  "..",
  "packages",
  "ui",
  "themes",
  "presets.css",
);

const BLOCK_PATTERN = /html\[data-theme="([\w-]+)"](\.dark)?\s*{([^}]*)}/g;
const DECLARATION_PATTERN = /--([\w-]+):\s*([^;]+);/g;

type PaletteBlock = {
  readonly colors: ThemeColors;
  readonly isDark: boolean;
  readonly name: string;
  readonly radius?: string;
};

function parseBlock([
  ,
  name = "",
  dark,
  body = "",
]: RegExpExecArray): PaletteBlock {
  const declarations = [...body.matchAll(DECLARATION_PATTERN)]
    .map(([, token = "", value = ""]) => [token, value.trim()] as const)
    .sort(([a], [b]) => a.localeCompare(b));
  return {
    colors: Object.fromEntries(
      declarations.filter(([token]) => token !== "radius"),
    ),
    isDark: Boolean(dark),
    name,
    radius: declarations.find(([token]) => token === "radius")?.[1],
  };
}

/** Parses `html[data-theme="<name>"]` (light) and `.dark` rule blocks into palettes. */
export function parsePresetPalettes(css: string): Map<string, ThemeData> {
  const blocks = [...css.matchAll(BLOCK_PATTERN)].map((match) =>
    parseBlock(match),
  );
  const names = [...new Set(blocks.map((block) => block.name))];
  return new Map(
    names.map((name) => {
      const own = blocks.filter((block) => block.name === name);
      const light = own.find((block) => !block.isDark);
      const dark = own.find((block) => block.isDark);
      return [
        name,
        {
          dark: dark?.colors ?? {},
          light: light?.colors ?? {},
          radius: light?.radius ?? dark?.radius ?? DEFAULT_RADIUS,
        },
      ];
    }),
  );
}

/** Editor presets in `THEME_PRESETS` order; `default` uses the base tokens. */
export async function loadEditorPresets(): Promise<EditorPreset[]> {
  const palettes = parsePresetPalettes(
    await readFile(PRESETS_CSS_PATH, "utf8"),
  );
  return THEME_PRESETS.map((preset) => {
    const theme =
      preset.name === "default" ? DEFAULT_THEME : palettes.get(preset.name);
    if (!theme) {
      throw new Error(`presets.css has no palette for "${preset.name}"`);
    }
    return { ...preset, theme };
  });
}
