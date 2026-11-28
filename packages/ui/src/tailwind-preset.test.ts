import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { describe, expect, it } from "vitest";

import preset from "./tailwind-preset";

/*
 * The workbench roles of the default theme (issue #768) reach Tailwind as
 * colours with alpha. `composer` reads `--composer-border`; the other names are
 * the role names. The list is the contract: a rename here is a breaking change.
 */

const ROLES: readonly (readonly [className: string, variable: string])[] = [
  ["bg-sidebar", "--sidebar"],
  ["bg-pill", "--pill"],
  ["border-pill-border", "--pill-border"],
  ["border-composer", "--composer-border"],
  ["text-status-needs-you", "--status-needs-you"],
  ["text-status-unread", "--status-unread"],
  ["text-status-failed", "--status-failed"],
  ["text-status-done", "--status-done"],
  ["text-status-ring", "--status-ring"],
];

async function css(classes: readonly string[]): Promise<string> {
  const result = await postcss([
    tailwindcss({
      ...preset,
      content: [{ extension: "html", raw: `<i class="${classes.join(" ")}">` }],
    }),
  ]).process("@tailwind utilities;", { from: undefined });
  return result.css;
}

describe("workbench colours in the published preset", () => {
  it.each(ROLES)("maps %s to oklch(var(%s))", async (className, variable) => {
    const output = await css([className]);
    expect(output).toContain(`oklch(var(${variable}) / var(--tw-`);
  });

  it("takes an alpha modifier", async () => {
    expect(await css(["bg-status-done/50"])).toContain(
      "oklch(var(--status-done) / 0.5)",
    );
  });
});

/*
 * Flat default theme (issue #768): every shadow step and the large radius
 * steps read theme tokens, so a component's raw `shadow-lg` or `rounded-2xl`
 * follows the theme. The empty shadow token is `0 0 #0000`, not `none`: a
 * `shadow-*` utility writes a list (ring offset, ring, shadow) and `none`
 * would make the whole declaration invalid, focus rings included.
 */
const SHADOWS: readonly (readonly [className: string, variable: string])[] = [
  ["shadow-sm", "--shadow-raised"],
  ["shadow", "--shadow-raised"],
  ["shadow-md", "--shadow-overlay"],
  ["shadow-lg", "--shadow-overlay"],
  ["shadow-xl", "--shadow-floating"],
  ["shadow-2xl", "--shadow-floating"],
];

const RADII = ["rounded-xl", "rounded-2xl", "rounded-3xl"] as const;

describe("flat shadows and radii in the published preset", () => {
  it.each(SHADOWS)("maps %s to var(%s)", async (className, variable) => {
    const output = await css([className]);
    expect(output).toContain(`--tw-shadow: var(${variable})`);
    expect(output).toContain(
      "box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)",
    );
  });

  it.each(RADII)("maps %s to the surface radius", async (className) => {
    expect(await css([className])).toContain(
      "border-radius: var(--radius-surface)",
    );
  });

  it("keeps the library's own Tailwind config in step with the preset", async () => {
    const { default: config } = await import("../tailwind.config");
    const extend = config.theme?.extend ?? {};
    expect(extend.boxShadow).toEqual(preset.theme?.extend?.boxShadow);
    expect(extend.borderRadius).toEqual(preset.theme?.extend?.borderRadius);
  });
});
