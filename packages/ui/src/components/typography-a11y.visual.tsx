import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/experimental-ct-react";

import { Display } from "./display/display";
import { Heading } from "./heading/heading";
import { Prose } from "./prose/prose";
import { Text } from "./text/text";

declare global {
  interface Window {
    axe: {
      run: (
        context: Document | Element,
        options: object,
      ) => Promise<{ violations: { help: string; id: string }[] }>;
    };
  }
}

// Resolve axe-core (already in the pnpm store as a transitive dep) without adding
// a new dependency — inject its bundle into the mounted page and run it there.
const pnpmRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
  "node_modules",
  ".pnpm",
);
const axePackage = readdirSync(pnpmRoot).find((entry) =>
  entry.startsWith("axe-core@"),
);
if (!axePackage) {
  throw new Error("axe-core not found in the pnpm store");
}
const axeScriptPath = join(
  pnpmRoot,
  axePackage,
  "node_modules",
  "axe-core",
  "axe.min.js",
);

// Rules that assume a full-page/landmark scaffold — noise when scanning a single
// mounted component in isolation. Structural + contrast + ARIA rules stay on.
const disabledRules = [
  "bypass",
  "document-title",
  "html-has-lang",
  "html-lang-valid",
  "landmark-one-main",
  "meta-viewport",
  "page-has-heading-one",
  "region",
];

test.describe("Typography accessibility (axe) (#465)", () => {
  test("has no axe violations in light mode", async ({ mount, page }) => {
    await mount(
      <div>
        <Heading level={1}>Foundation typography</Heading>
        <Text size="lead">A lead paragraph introducing the section.</Text>
        <Heading level={2} size={3}>
          A subsection
        </Heading>
        <Text>Standard body copy with comfortable rhythm.</Text>
        <Display as="h2">Hero display</Display>
        <Prose>
          <h3>Nested article heading</h3>
          <p>A long-form paragraph inside the prose wrapper.</p>
          <ul>
            <li>First point</li>
            <li>Second point</li>
          </ul>
        </Prose>
      </div>,
    );
    await page.addScriptTag({ path: axeScriptPath });

    const violations = await page.evaluate(async (rules) => {
      const options = {
        rules: Object.fromEntries(rules.map((id) => [id, { enabled: false }])),
      };
      const result = await window.axe.run(document.body, options);
      return result.violations.map((violation) => violation.id);
    }, disabledRules);

    expect(violations, `axe violations: ${violations.join(", ")}`).toEqual([]);
  });

  test("has no axe violations in dark mode", async ({ mount, page }) => {
    await mount(
      <div>
        <Heading level={1}>Foundation typography</Heading>
        <Text size="lead">A lead paragraph introducing the section.</Text>
        <Heading level={2} size={3}>
          A subsection
        </Heading>
        <Text>Standard body copy with comfortable rhythm.</Text>
        <Display as="h2">Hero display</Display>
        <Prose>
          <h3>Nested article heading</h3>
          <p>A long-form paragraph inside the prose wrapper.</p>
          <ul>
            <li>First point</li>
            <li>Second point</li>
          </ul>
        </Prose>
      </div>,
    );
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.addScriptTag({ path: axeScriptPath });

    const violations = await page.evaluate(async (rules) => {
      const options = {
        rules: Object.fromEntries(rules.map((id) => [id, { enabled: false }])),
      };
      const result = await window.axe.run(document.body, options);
      return result.violations.map((violation) => violation.id);
    }, disabledRules);

    expect(violations, `axe violations: ${violations.join(", ")}`).toEqual([]);
  });
});
