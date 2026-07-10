import { describe, expect, it, vi } from "vitest";

// @/i18n/routing pulls next-intl/navigation, which cannot load in the node test
// environment. breadcrumbTrailLd -> canonical (lib/seo) needs the locale
// constants, so stub the module the same way lib/og.test.ts does.
vi.mock("@/i18n/routing", () => ({
  routing: { defaultLocale: "en", locales: ["en", "fr"] },
}));

import { breadcrumbTrailLd } from "./jsonld";

/**
 * Regression guard for the locale-JSON-LD bug: page structured-data URLs were
 * built from `${SITE_URL}${pathname}` with no locale segment, so every /fr page
 * emitted English URLs that mismatched its own canonical. breadcrumbTrailLd is
 * the single chokepoint that resolves every crumb through canonical(path,
 * locale); these tests lock that a non-default locale prefixes every crumb URL
 * and the default locale prefixes none.
 */
describe("breadcrumbTrailLd", () => {
  it("prefixes every crumb URL with the locale segment for a non-default locale", () => {
    const json = JSON.stringify(
      breadcrumbTrailLd("fr", [{ name: "Docs", path: "/docs" }]),
    );

    expect(json).toContain('"@type":"BreadcrumbList"');
    // The helper adds Home as the first crumb at position 1, pointing at /fr.
    expect(json).toMatch(
      /"item":"https:\/\/[^"]*\/fr","name":"Home","position":1/,
    );
    // The trailing crumb resolves to the /fr-prefixed docs URL, not /docs.
    expect(json).toMatch(
      /"item":"https:\/\/[^"]*\/fr\/docs","name":"Docs","position":2/,
    );
  });

  it("emits no locale segment for the default locale", () => {
    const json = JSON.stringify(
      breadcrumbTrailLd("en", [{ name: "Docs", path: "/docs" }]),
    );

    expect(json).not.toContain("/fr");
    expect(json).toMatch(/"name":"Home","position":1/);
    expect(json).toMatch(
      /"item":"https:\/\/[^"]*\/docs","name":"Docs","position":2/,
    );
  });

  it("prefixes deep trails and numbers positions sequentially from Home", () => {
    const json = JSON.stringify(
      breadcrumbTrailLd("fr", [
        { name: "Components", path: "/components" },
        { name: "Button", path: "/components/button" },
      ]),
    );

    expect(json).toMatch(
      /"item":"https:\/\/[^"]*\/fr\/components","name":"Components","position":2/,
    );
    expect(json).toMatch(
      /"item":"https:\/\/[^"]*\/fr\/components\/button","name":"Button","position":3/,
    );
  });
});
