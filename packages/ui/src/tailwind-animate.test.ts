import { existsSync } from "node:fs";

import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { describe, expect, it } from "vitest";

import localConfig from "../tailwind.config";

import preset from "./tailwind-preset";

/*
 * The in-house animation plugin replaces `tailwindcss-animate`. Each rule below
 * is what that package 1.0.7 generated for the class; compiling every utility
 * with both plugins gave identical CSS.
 */

const ENTER = ["opacity", "scale", "rotate", "translate-x", "translate-y"]
  .map((name) => `--tw-enter-${name}: initial`)
  .join("; ");
const EXIT = ["opacity", "scale", "rotate", "translate-x", "translate-y"]
  .map((name) => `--tw-exit-${name}: initial`)
  .join("; ");

const RULES: readonly (readonly [string, string])[] = [
  [
    "animate-in",
    `.animate-in { animation-name: enter; animation-duration: 150ms; ${ENTER} }`,
  ],
  [
    "animate-out",
    `.animate-out { animation-name: exit; animation-duration: 150ms; ${EXIT} }`,
  ],
  ["fade-in-0", ".fade-in-0 { --tw-enter-opacity: 0 }"],
  ["zoom-out-95", ".zoom-out-95 { --tw-exit-scale: .95 }"],
  ["spin-in-90", ".spin-in-90 { --tw-enter-rotate: 90deg }"],
  [
    "slide-in-from-top-2",
    ".slide-in-from-top-2 { --tw-enter-translate-y: -0.5rem }",
  ],
  ["slide-out-to-right", ".slide-out-to-right { --tw-exit-translate-x: 100% }"],
  ["duration-300", ".duration-300 { animation-duration: 300ms }"],
  ["delay-150", ".delay-150 { animation-delay: 150ms }"],
  [
    "ease-in-out",
    ".ease-in-out { animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1) }",
  ],
  ["running", ".running { animation-play-state: running }"],
  [
    "fill-mode-forwards",
    ".fill-mode-forwards { animation-fill-mode: forwards }",
  ],
  ["direction-reverse", ".direction-reverse { animation-direction: reverse }"],
  [
    "repeat-infinite",
    ".repeat-infinite { animation-iteration-count: infinite }",
  ],
];

async function css(config: object, classes: string[]): Promise<string> {
  const result = await postcss([
    tailwindcss({
      ...config,
      content: [{ extension: "html", raw: `<i class="${classes.join(" ")}">` }],
    }),
  ]).process("@tailwind utilities;", { from: undefined });
  return result.css.replaceAll(/\s+/g, " ");
}

describe.each([
  ["the published preset", preset],
  ["the library config", localConfig],
])("animation utilities in %s", (_name, config) => {
  it.each(RULES)("generates %s", async (name, rule) => {
    expect(await css(config, [name])).toContain(rule);
  });

  it("defines the enter and exit keyframes next to the utilities", async () => {
    const output = await css(config, ["animate-in", "animate-out"]);
    expect(output).toContain(
      "@keyframes enter { from { opacity: var(--tw-enter-opacity, 1); transform: translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0)) } }",
    );
    expect(output).toContain("@keyframes exit { to {");
  });

  it("keeps variants working on the animation utilities", async () => {
    const output = await css(config, ["data-[state=open]:fade-in-0"]);
    expect(output).toContain(
      '.data-\\[state\\=open\\]\\:fade-in-0[data-state="open"] { --tw-enter-opacity: 0 }',
    );
  });
});

describe("the preset content scan", () => {
  const excluded = (Array.isArray(preset.content) ? preset.content : [])
    .filter((entry): entry is string => typeof entry === "string")
    .filter((entry) => entry.startsWith("!"))
    .map((entry) => entry.slice(1));

  it("skips the files that list class names as data", () => {
    expect(excluded).toHaveLength(2);
  });

  it.each(excluded)("skips %s, a built file whose source exists", (file) => {
    expect(existsSync(file.replace(/\.js$/, ".ts"))).toBe(true);
  });
});
