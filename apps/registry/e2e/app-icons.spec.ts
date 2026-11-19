import { expect, test } from "@playwright/test";

/**
 * The app icons live at the app root, outside `[locale]`. The middleware must
 * leave them alone: a locale rewrite sends them to a page that does not exist.
 * The web manifest points at both, so a 404 here breaks "Add to Home Screen".
 */
for (const [path, type] of [
  ["/apple-icon", "image/png"],
  ["/icon.svg", "image/svg+xml"],
] as const) {
  test(`${path} answers the icon itself`, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain(type);
  });
}
