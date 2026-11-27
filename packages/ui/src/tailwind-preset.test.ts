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
