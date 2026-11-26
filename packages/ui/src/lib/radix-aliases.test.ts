import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const css = readFileSync(join(__dirname, "../../styles.css"), "utf8");

const popups = [
  "popover",
  "hover-card",
  "tooltip",
  "select",
  "dropdown-menu",
  "context-menu",
  "menubar",
];

const aliases = {
  "content-available-height": "available-height",
  "content-available-width": "available-width",
  "content-transform-origin": "transform-origin",
  "trigger-height": "anchor-height",
  "trigger-width": "anchor-width",
};

describe("Radix popup variables", () => {
  it.each(popups)(
    "defines the five --radix-%s-* variables on one class",
    (popup) => {
      const rule = new RegExp(`\\.vllnt-radix-${popup}\\s*\\{([^}]*)\\}`).exec(
        css,
      );

      expect(rule).not.toBeNull();
      Object.entries(aliases).forEach(([name, source]) => {
        expect(rule?.[1]).toContain(
          `--radix-${popup}-${name}: var(--${source});`,
        );
      });
    },
  );
});
