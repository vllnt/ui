import { expect, type Page, test } from "@playwright/test";

type Crumb = {
  readonly itemNames: readonly string[];
  readonly name: unknown;
};

type Route = {
  readonly breadcrumb: "optional" | "required";
  readonly path: string;
};

const EXTERNAL = Boolean(process.env.PLAYWRIGHT_BASE_URL);
const ARTICLE_SLUG = "fixture-article";

const ROUTES: readonly Route[] = [
  { breadcrumb: "optional", path: "/" },
  { breadcrumb: "required", path: "/components/button" },
  { breadcrumb: "required", path: "/families/form" },
  { breadcrumb: "required", path: "/docs/installation" },
  ...(EXTERNAL
    ? []
    : [
        { breadcrumb: "required", path: "/articles" },
        { breadcrumb: "required", path: `/articles/${ARTICLE_SLUG}` },
      ]),
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectBreadcrumbs(value: unknown, found: Crumb[]): void {
  if (Array.isArray(value)) {
    for (const entry of value) collectBreadcrumbs(entry, found);

    return;
  }
  if (!isRecord(value)) return;

  if (value["@type"] === "BreadcrumbList") {
    const items = Array.isArray(value.itemListElement)
      ? value.itemListElement
      : [];
    found.push({
      itemNames: items.map((item) =>
        isRecord(item) && typeof item.name === "string" ? item.name : "",
      ),
      name: value.name,
    });
  }
  for (const child of Object.values(value)) collectBreadcrumbs(child, found);
}

/**
 * Reads every `BreadcrumbList` a page emits, whether it is a top-level node or
 * inside an `@graph`. Pages inject their JSON-LD either on the server or
 * through `next/script` after hydration, so the read polls until a JSON-LD
 * block exists.
 */
async function readBreadcrumbs(page: Page, path: string): Promise<Crumb[]> {
  await page.goto(path);
  await expect
    .poll(
      () => page.locator('script[type="application/ld+json"]').count(),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);

  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const found: Crumb[] = [];
  for (const block of blocks) {
    collectBreadcrumbs(JSON.parse(block), found);
  }

  return found;
}

test.describe("breadcrumb JSON-LD names every item", () => {
  for (const prefix of ["", "/fr"]) {
    for (const { breadcrumb, path } of ROUTES) {
      const route = `${prefix}${path === "/" ? "" : path}` || "/";

      test(`${route} has a name on the list and on every item`, async ({
        page,
      }) => {
        const lists = await readBreadcrumbs(page, route);

        if (breadcrumb === "required") expect(lists.length).toBeGreaterThan(0);
        for (const list of lists) {
          expect(typeof list.name === "string" && list.name.trim()).toBeTruthy();
          expect(list.itemNames.length).toBeGreaterThan(0);
          for (const name of list.itemNames) {
            expect(name.trim()).not.toBe("");
          }
        }
      });
    }
  }
});
