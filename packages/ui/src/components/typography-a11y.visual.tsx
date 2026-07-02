import { createRequire } from "node:module";

import { expect, test } from "@playwright/experimental-ct-react";
import type { Page } from "@playwright/test";

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

// axe-core is an explicit devDependency; resolve its bundle location
// hoist/version-agnostically and inject it into the mounted page.
const axeScriptPath = createRequire(import.meta.url).resolve(
  "axe-core/axe.min.js",
);

// Rules that assume a full-page/landmark scaffold — noise when scanning a single
// mounted component in isolation. Structural + ARIA rules stay on. (axe 4.x does
// not compute contrast on oklch() colors — contrast is verified below via a
// canvas-based sRGB readback instead.)
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

type Audit = {
  contrasts: { ratio: number; text: string }[];
  violations: string[];
};

async function audit(page: Page): Promise<Audit> {
  await page.addScriptTag({ path: axeScriptPath });
  return page.evaluate(async (rules) => {
    const toRgb = (color: string): [number, number, number] => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        return [0, 0, 0];
      }
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      return [red, green, blue];
    };
    const luminance = ([red, green, blue]: [number, number, number]): number => {
      const channel = (value: number): number => {
        const v = value / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
    };
    const backgroundOf = (element: Element): string => {
      let node: Element | null = element;
      while (node) {
        const background = getComputedStyle(node).backgroundColor;
        if (background && background !== "rgba(0, 0, 0, 0)") {
          return background;
        }
        node = node.parentElement;
      }
      return "rgb(255, 255, 255)";
    };
    const contrast = (element: Element): number => {
      const foreground = luminance(toRgb(getComputedStyle(element).color));
      const background = luminance(toRgb(backgroundOf(element)));
      const [high, low] =
        foreground > background
          ? [foreground, background]
          : [background, foreground];
      return (high + 0.05) / (low + 0.05);
    };

    const options = {
      rules: Object.fromEntries(rules.map((id) => [id, { enabled: false }])),
    };
    const result = await window.axe.run(document.body, options);
    return {
      contrasts: [...document.querySelectorAll("p, h1, h2, h3, h4, li")].map(
        (element) => ({
          ratio: Math.round(contrast(element) * 100) / 100,
          text: (element.textContent ?? "").slice(0, 24),
        }),
      ),
      violations: result.violations.map((entry) => entry.id),
    };
  }, disabledRules);
}

const sample = (
  <div className="bg-background p-4 text-foreground">
    <Heading level={1}>Foundation typography</Heading>
    <Text size="lead">A lead paragraph introducing the section.</Text>
    <Heading level={2} size={3}>
      A subsection
    </Heading>
    <Text>Standard body copy with comfortable rhythm.</Text>
    <Text size="caption" tone="muted">
      Muted caption metadata line.
    </Text>
    <Display as="h2">Hero display</Display>
    <Prose>
      <h3>Nested article heading</h3>
      <p>A long-form paragraph inside the prose wrapper.</p>
      <ul>
        <li>First point</li>
        <li>Second point</li>
      </ul>
    </Prose>
  </div>
);

test.describe("Typography accessibility (#465)", () => {
  test("no axe violations + AA contrast in light mode", async ({
    mount,
    page,
  }) => {
    await mount(sample);
    const { contrasts, violations } = await audit(page);

    expect(violations, `axe violations: ${violations.join(", ")}`).toEqual([]);
    for (const { ratio, text } of contrasts) {
      expect(ratio, `contrast of "${text}"`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("no axe violations + AA contrast in dark mode", async ({
    mount,
    page,
  }) => {
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await mount(sample);
    const { contrasts, violations } = await audit(page);

    expect(violations, `axe violations: ${violations.join(", ")}`).toEqual([]);
    for (const { ratio, text } of contrasts) {
      expect(ratio, `contrast of "${text}"`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
