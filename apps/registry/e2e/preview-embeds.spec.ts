/**
 * Live preview E2E — verify a DEPLOYED registry shows previews wired to the
 * matching, reachable Storybook instance.
 *
 * The build-time guard (scripts/verify-preview-stories.ts) proves metadata IDs
 * match the Storybook build from the SAME commit. This is the complementary
 * runtime layer: it hits the actual deployed pages and asserts the embedded
 * iframe's story ID resolves against the LIVE Storybook the deployment points
 * at — catching deploy-env issues the static check can't see (wrong
 * NEXT_PUBLIC_STORYBOOK_URL, registry↔storybook version skew, an unrouted
 * storybook origin).
 *
 * Where it runs (playwright.config.ts reads PLAYWRIGHT_BASE_URL):
 *   - ntk promote gate — `PLAYWRIGHT_BASE_URL=$NTK_PREVIEW_URL … test:e2e`
 *     runs this against the live PR preview before a prod promote (ntk.yaml).
 *   - production — `PLAYWRIGHT_BASE_URL=https://ui.vllnt.com pnpm -F
 *     @vllnt/ui-registry test:e2e`.
 *   - local / GH Actions e2e job — no PLAYWRIGHT_BASE_URL, so it hits the dev
 *     server whose Storybook origin (localhost:6006) is not running; the live
 *     assertions self-skip (see below) and only the page↔metadata wiring check
 *     runs.
 *
 * Infra vs code (per the ntk-preview flakiness lessons): a reachable Storybook
 * that is MISSING a referenced story is a real bug → FAIL. A Storybook origin
 * that is unreachable (tailnet-only, not provisioned for this PR, transient
 * 5xx) is infra → SKIP, never a false red that blocks a promote.
 */

import { readFileSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

type ComponentMeta = {
  defaultStoryId: string;
  name: string;
  stories: { id: string; name: string }[];
};

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:41599";

const metadata = JSON.parse(
  readFileSync(new URL("../lib/component-metadata.json", import.meta.url), "utf8"),
) as Record<string, ComponentMeta>;

const components = Object.values(metadata).filter((c) => c.defaultStoryId);

/** A spread of components for the per-page render check, always incl. the one
 *  that regressed (ai-source-citation). The full set is id-checked in bulk. */
const renderSample = (() => {
  const count = Math.min(6, components.length);
  const step = Math.max(1, Math.floor(components.length / count));
  const sample = Array.from({ length: count }, (_, i) => components[i * step]!);
  const regressed = components.find((c) => c.name === "ai-source-citation");
  if (regressed && !sample.some((c) => c.name === "ai-source-citation")) {
    sample[0] = regressed;
  }
  return sample;
})();

/** Discovered once per worker: the Storybook origin the deployment embeds, and
 *  its live story-id set (null when the origin is unreachable = infra). */
let live: { ids: null | Set<string>; origin: string };

async function readIframeSource(page: Page, slug: string): Promise<string> {
  await page.goto(`/components/${slug}`);
  const iframe = page.locator('iframe[src*="/iframe.html"]').first();
  await iframe.waitFor({ state: "attached", timeout: 30_000 });
  const source = await iframe.getAttribute("src");
  if (!source) throw new Error(`no Storybook iframe on /components/${slug}`);
  return source;
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();
  try {
    const source = await readIframeSource(page, "ai-source-citation");
    const origin = new URL(source).origin;
    let ids: null | Set<string> = null;
    try {
      const response = await context.request.get(`${origin}/index.json`, {
        timeout: 15_000,
      });
      if (response.ok()) {
        const index = (await response.json()) as {
          entries: Record<string, { type?: string }>;
        };
        ids = new Set(
          Object.entries(index.entries)
            .filter(([, entry]) => entry.type === "story")
            .map(([id]) => id),
        );
      }
    } catch {
      ids = null;
    }
    live = { ids, origin };
  } finally {
    await context.close();
  }
});

test("every deployed preview id resolves to a real story in the live Storybook", async () => {
  test.skip(
    live.ids === null,
    `Storybook origin ${live.origin} unreachable (tailnet/infra or preview not provisioned) — skipping live id assertions`,
  );

  const missing: string[] = [];
  for (const component of components) {
    const referenced = new Set([
      component.defaultStoryId,
      ...component.stories.map((story) => story.id),
    ]);
    for (const id of referenced) {
      if (id && !live.ids!.has(id)) missing.push(`${component.name} → ${id}`);
    }
  }

  expect(
    missing,
    `${missing.length} preview id(s) are not real stories in ${live.origin}/index.json:\n${missing.join("\n")}`,
  ).toEqual([]);
});

for (const component of renderSample) {
  test(`/components/${component.name} embeds its metadata story id`, async ({
    page,
  }) => {
    const source = await readIframeSource(page, component.name);
    const embeddedId = new URL(source).searchParams.get("id");

    expect(
      embeddedId,
      `${component.name}: embedded iframe id must equal its metadata defaultStoryId`,
    ).toBe(component.defaultStoryId);

    test.skip(
      live.ids === null,
      `Storybook origin unreachable — skipping live resolution for ${component.name}`,
    );
    expect(
      live.ids!.has(embeddedId!),
      `${component.name}: embedded story id "${embeddedId}" is not a real story in ${live.origin}`,
    ).toBe(true);
  });
}
