import { describe, expect, it, vi } from "vitest";

// @/i18n/routing pulls next-intl/navigation, which cannot load in the node test
// environment. breadcrumbTrailLd -> canonical (lib/seo) needs the locale
// constants, so stub the module the same way lib/og.test.ts does.
vi.mock("@/i18n/routing", () => ({
  routing: { defaultLocale: "en", locales: ["en", "fr"] },
}));

import {
  articleLd,
  breadcrumbLd,
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
 * Search Console showed "Unnamed item" for a detected BreadcrumbList. The list
 * now carries the name of the page it describes, and an item without a name
 * fails the build, so no page can ship a breadcrumb Google cannot label.
 */
describe("breadcrumbLd names", () => {
  it("names the list after its last crumb and every item after its crumb", () => {
    const node = breadcrumbLd([
      { name: "Home", url: "https://ui.vllnt.com" },
      { name: "Articles", url: "https://ui.vllnt.com/articles" },
    ]);

    expect(node.name).toBe("Articles");
    expect(node.itemListElement).toEqual([
      {
        "@type": "ListItem",
        item: "https://ui.vllnt.com",
        name: "Home",
        position: 1,
      },
      {
        "@type": "ListItem",
        item: "https://ui.vllnt.com/articles",
        name: "Articles",
        position: 2,
      },
    ]);
  });

  it.each(["", "   "])("throws for the item name %j", (name) => {
    expect(() =>
      breadcrumbLd([
        { name: "Home", url: "https://ui.vllnt.com" },
        { name, url: "https://ui.vllnt.com/articles" },
      ]),
    ).toThrow("BreadcrumbList item https://ui.vllnt.com/articles has no name");
  });

  it("throws through breadcrumbTrailLd for a blank crumb or a blank home name", () => {
    expect(() =>
      breadcrumbTrailLd("en", [{ name: "", path: "/docs" }]),
    ).toThrow("has no name");
    expect(() =>
      breadcrumbTrailLd("fr", [{ name: "Docs", path: "/docs" }], ""),
    ).toThrow("has no name");
  });

  it("names the list through breadcrumbTrailLd in the active locale", () => {
    const node = breadcrumbTrailLd(
      "fr",
      [{ name: "Articles", path: "/articles" }],
      "Accueil",
    );

    expect(node.name).toBe("Articles");
    expect(JSON.stringify(node)).toContain('"name":"Accueil","position":1');
  });
});

describe("articleLd", () => {
  const input = {
    dateModified: "2026-11-02",
    datePublished: "2026-10-05",
    description: "A description.",
    image: "https://ui.vllnt.com/api/og?title=A+title",
    inLanguage: "fr",
    keywords: ["fixtures", "glass-surfaces"],
    title: "A headline",
    url: "https://ui.vllnt.com/fr/articles/a-slug",
  };

  it("describes an Article with its dates, language, image and page", () => {
    expect(articleLd(input)).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Article",
      dateModified: "2026-11-02",
      datePublished: "2026-10-05",
      description: "A description.",
      headline: "A headline",
      image: "https://ui.vllnt.com/api/og?title=A+title",
      inLanguage: "fr",
      keywords: "fixtures, glass-surfaces",
      mainEntityOfPage: {
        "@id": "https://ui.vllnt.com/fr/articles/a-slug",
        "@type": "WebPage",
      },
      url: "https://ui.vllnt.com/fr/articles/a-slug",
    });
  });

  it("names the same Organization as author and publisher", () => {
    const node = articleLd(input);
    const organization = {
      "@type": "Organization",
      name: "VLLNT",
      url: SITE_URL,
    };

    expect(node.author).toEqual(organization);
    expect(node.publisher).toEqual(organization);
  });

  it("leaves keywords out when there are none", () => {
    expect(articleLd({ ...input, keywords: [] })).not.toHaveProperty(
      "keywords",
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
