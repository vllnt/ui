import { expect, type Page, test } from "@playwright/test";

const EM_DASH = String.fromCodePoint(0x2014);

const SAMPLE_ROUTES = [
  "/",
  "/this-page-does-not-exist",
  "/design",
  "/themes",
  "/philosophy",
  "/families",
  "/families/ai",
  "/families/form",
  "/docs/installation",
  "/docs/theming",
  "/docs/agents",
  "/build/ai-chat-ui",
  "/build/tool-calls-agent-steps",
  "/vs/shadcn",
  "/vs/vercel-ai-sdk",
  "/components",
  "/components?platform=native",
  "/components/button",
  "/components/ai-tool-call-display",
  "/components/timeline-scrubber",
  "/components/gantt-chart",
  "/components/liquid-glass",
  "/components/sidebar",
];

function localized(route: string, locale: "en" | "fr"): string {
  if (locale === "en") return route;

  return route === "/" ? "/fr" : `/fr${route}`;
}

async function emittedTexts(page: Page): Promise<Record<string, string>> {
  const content = async (selector: string): Promise<string> =>
    (await page.locator(selector).first().getAttribute("content")) ?? "";

  return {
    description: await content('meta[name="description"]'),
    "og:description": await content('meta[property="og:description"]'),
    "og:title": await content('meta[property="og:title"]'),
    title: await page.title(),
    "twitter:description": await content('meta[name="twitter:description"]'),
    "twitter:title": await content('meta[name="twitter:title"]'),
  };
}

test.describe("no em dash in titles and descriptions", () => {
  for (const locale of ["en", "fr"] as const) {
    for (const route of SAMPLE_ROUTES) {
      const url = localized(route, locale);

      test(`${url}`, async ({ page }) => {
        await page.goto(url);
        const texts = await emittedTexts(page);

        expect(texts.title).not.toBe("");
        for (const [name, text] of Object.entries(texts)) {
          expect(text, `${url} ${name}`).not.toContain(EM_DASH);
        }
      });
    }
  }
});
