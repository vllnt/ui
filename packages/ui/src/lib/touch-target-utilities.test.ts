import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { describe, expect, it } from "vitest";

import localConfig from "../../tailwind.config";
import preset from "../tailwind-preset";

/*
 * The touch-target utilities read the tokens that rise under
 * `@media (pointer: coarse)` (DESIGN.md "Touch targets"); none depends on
 * screen width. The published preset and the library's own config (Storybook
 * and component tests) both carry them; the registry app's config mirrors them.
 */

const CLASSES = ["min-h-target", "min-w-target", "h-control-xs"];

async function css(config: object): Promise<string> {
  const result = await postcss([
    tailwindcss({
      ...config,
      content: [{ extension: "html", raw: `<i class="${CLASSES.join(" ")}">` }],
    }),
  ]).process("@tailwind utilities;", { from: undefined });
  return result.css;
}

describe.each([
  ["the published preset", preset],
  ["the library config", localConfig],
])("touch-target utilities in %s", (_name, config) => {
  it("maps min-h-target and min-w-target to --size-target-min", async () => {
    const output = await css(config);
    expect(output).toMatch(
      /\.min-h-target\s*{\s*min-height: var\(--size-target-min\)/,
    );
    expect(output).toMatch(
      /\.min-w-target\s*{\s*min-width: var\(--size-target-min\)/,
    );
  });

  it("maps h-control-xs to --size-control-xs", async () => {
    expect(await css(config)).toMatch(
      /\.h-control-xs\s*{\s*height: var\(--size-control-xs\)/,
    );
  });

  it("never keys a target on screen width", async () => {
    expect(await css(config)).not.toContain("@media (min-width");
  });
});
