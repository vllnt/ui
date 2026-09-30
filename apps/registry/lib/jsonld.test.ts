import { describe, expect, it, vi } from "vitest";

// @/i18n/routing pulls next-intl/navigation, which cannot load in the node test
// environment. breadcrumbTrailLd -> canonical (lib/seo) needs the locale
// constants, so stub the module the same way lib/og.test.ts does.
vi.mock("@/i18n/routing", () => ({
  routing: { defaultLocale: "en", locales: ["en", "fr"] },
}));

import {
  breadcrumbTrailLd,
  jsonLdScript,
  softwareApplicationLd,
  softwareSourceCodeLd,
} from "./jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";
/** Each locale with the path prefix its URLs must carry (none for the default). */
const LOCALE_PREFIXES = [
  ["fr", "/fr"],
  ["en", ""],
] as const;

describe("jsonLdScript", () => {
  it("wraps multiple nodes in a standards-compliant graph document", () => {
    const script = jsonLdScript([
      Object.fromEntries([
        ["@context", "https://schema.org"],
        ["@type", "Organization"],
      ]),
      Object.fromEntries([
        ["@context", "https://schema.org"],
        ["@type", "WebSite"],
      ]),
    ]);
    const document = JSON.parse(script) as Record<string, unknown>;

    expect(document["@context"]).toBe("https://schema.org");
    expect(document["@graph"]).toEqual([
      Object.fromEntries([["@type", "Organization"]]),
      Object.fromEntries([["@type", "WebSite"]]),
    ]);
  });

  it("leaves a single node unwrapped", () => {
    const node = Object.fromEntries([
      ["@context", "https://schema.org"],
      ["@type", "WebSite"],
    ]);

    expect(JSON.parse(jsonLdScript(node))).toEqual(node);
  });
});

/**
 * Regression guard for the locale-JSON-LD bug: page structured-data URLs were
 * built from `${SITE_URL}${pathname}` with no locale segment, so every /fr page
 * emitted English URLs that mismatched its own canonical. breadcrumbTrailLd is
 * the single chokepoint that resolves every crumb through canonical(path,
 * locale); these tests lock that a non-default locale prefixes every crumb URL
 * and the default locale prefixes none.
 */
describe("breadcrumbTrailLd", () => {
  it.each(LOCALE_PREFIXES)(
    "resolves every crumb URL through the %s locale prefix",
    (locale, prefix) => {
      const json = JSON.stringify(
        breadcrumbTrailLd(locale, [{ name: "Docs", path: "/docs" }]),
      );

      expect(json).toContain('"@type":"BreadcrumbList"');
      // The helper adds Home as the first crumb at position 1.
      expect(json).toContain(
        `"item":"${SITE_URL}${prefix}","name":"Home","position":1`,
      );
      expect(json).toContain(
        `"item":"${SITE_URL}${prefix}/docs","name":"Docs","position":2`,
      );
    },
  );

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

/**
 * softwareSourceCodeLd builds the component page URL itself, so it carries the
 * same locale hazard as the breadcrumb trail: a /fr component page must not
 * advertise the English URL as its SoftwareSourceCode url.
 */
describe("softwareApplicationLd", () => {
  it("accepts renderer-specific runtime requirements without an install action", () => {
    const result = softwareApplicationLd({
      description: "Experimental native renderer.",
      name: "@vllnt/ui-native",
      operatingSystem: ["Android", "iOS"],
      softwareRequirements: "React 19 and React Native 0.81+",
      url: "https://ui.vllnt.com/native",
    });

    expect(result.operatingSystem).toEqual(["Android", "iOS"]);
    expect(result.softwareRequirements).toBe("React 19 and React Native 0.81+");
    expect(result).not.toHaveProperty("potentialAction");
  });
});

describe("softwareSourceCodeLd", () => {
  it.each(LOCALE_PREFIXES)(
    "points at the %s locale URL of the component page",
    (locale, prefix) => {
      const result = softwareSourceCodeLd({
        description: "A button.",
        locale,
        name: "button",
        platforms: ["web"],
        title: "Button",
      });

      expect(result.url).toBe(`${SITE_URL}${prefix}/components/button`);
    },
  );

  it("accepts an explicit filtered component URL", () => {
    const result = softwareSourceCodeLd({
      description: "A button.",
      locale: "en",
      name: "button",
      platforms: ["web", "native"],
      title: "Button",
      url: "https://ui.vllnt.com/components/button?platform=native",
    });

    expect(result.url).toBe(
      "https://ui.vllnt.com/components/button?platform=native",
    );
  });

  it("describes both renderer runtimes for a dual-platform component", () => {
    const result = softwareSourceCodeLd({
      description: "A button.",
      locale: "en",
      name: "button",
      platforms: ["web", "native"],
      title: "Button",
    });

    expect(result.runtimePlatform).toEqual(["React", "React Native"]);
  });
});
