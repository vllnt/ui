import { writeFileSync } from "node:fs";

import { THEME_PRESETS } from "../theme-presets";

import {
  fitInput,
  type InputFit,
  type Mode,
  palette,
  readTheme,
  themePath,
  token,
} from "./theme-colors";

/*
 * Fits each preset's own `--input` to the control boundary rule: 3:1 on
 * background, card, popover and muted, in light and dark (DESIGN.md §3). The
 * lightness moves by the smallest 0.001 step that passes, so the preset keeps
 * its hue and chroma. Prints a markdown table; `--write` updates
 * themes/presets.css.
 *
 *   pnpm -F @vllnt/ui exec tsx src/lib/__tests__/fit-preset-inputs.ts [--write]
 */

const MODES: readonly Mode[] = ["light", "dark"];

type Row = {
  readonly fit: InputFit;
  readonly mode: Mode;
  readonly preset: string;
  readonly was: string;
};

function formatRatio({ ratio, surface }: InputFit["after"]): string {
  return `${ratio.toFixed(3)} on ${surface}`;
}

function toRow(preset: string, mode: Mode): Row {
  const colors = palette(preset, mode);
  return { fit: fitInput(colors), mode, preset, was: token(colors, "input") };
}

function toTable(rows: readonly Row[]): string {
  return [
    "| Preset | Mode | Before | After | Worst before | Worst after |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows.map(
      ({ fit, mode, preset, was }) =>
        `| ${preset} | ${mode} | \`${was}\` | \`${fit.value}\` | ${formatRatio(fit.before)} | ${formatRatio(fit.after)} |`,
    ),
  ].join("\n");
}

function setInput(css: string, { fit, mode, preset }: Row): string {
  const selector = `html[data-theme="${preset}"]${mode === "dark" ? ".dark" : ""} {`;
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Missing CSS block ${selector}`);
  const end = css.indexOf("}", start);
  const body = css.slice(start, end);
  const pattern = /--input:[^;]+;/g;
  if ([...body.matchAll(pattern)].length !== 1) {
    throw new Error(`Expected one --input in ${selector}`);
  }
  return `${css.slice(0, start)}${body.replaceAll(pattern, `--input: ${fit.value};`)}${css.slice(end)}`;
}

function main(): void {
  const rows = THEME_PRESETS.filter(({ name }) => name !== "default").flatMap(
    ({ name }) => MODES.map((mode) => toRow(name, mode)),
  );
  process.stdout.write(`${toTable(rows)}\n`);

  if (!process.argv.includes("--write")) return;
  const changed = rows.filter(({ fit, was }) => fit.value !== was);
  const css = changed.reduce(setInput, readTheme("presets.css"));
  writeFileSync(themePath("presets.css"), css);
  process.stdout.write(`\nUpdated ${changed.length} --input values.\n`);
}

main();
