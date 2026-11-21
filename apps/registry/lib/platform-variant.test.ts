import { describe, expect, it } from "vitest";

import { registry } from "@/lib/registry";

import componentSlugs from "./component-slugs.json";
import { publicPagePathname, publicVariant } from "./platform-variant";
import { variantPathname } from "./platform-variant-rewrite";

describe("component-slugs.json", () => {
  it("lists every registry component", () => {
    expect(componentSlugs).toEqual(
      registry.items.map((item) => item.name).sort(),
    );
  });
});

describe("variantPathname", () => {
  it.each([
    ["/components", "native", "/en/p/native/components"],
    ["/components", "web", "/en/p/web/components"],
    ["/components/button", "native", "/en/p/native/components/button"],
    ["/fr/components/button", "native", "/fr/p/native/components/button"],
    ["/fr/components", "web", "/fr/p/web/components"],
    ["/docs/installation", "native", "/en/p/native/docs/installation"],
    ["/fr/docs/installation", "native", "/fr/p/native/docs/installation"],
    ["/families", "native", "/en/p/native/families"],
    ["/fr/families/ai", "native", "/fr/p/native/families/ai"],
  ])("rewrites %s?platform=%s", (pathname, platform, expected) => {
    expect(variantPathname(pathname, platform)).toBe(expected);
  });

  it.each([
    ["/components/button", undefined],
    ["/components/button", ""],
    ["/components/button", "bogus"],
    ["/components/button", "all"],
    ["/docs/installation", "web"],
    ["/families", "web"],
    ["/families/ai", "web"],
    ["/vision", "native"],
    ["/components/button/playground", "native"],
    ["/templates", "native"],
    ["/", "native"],
    ["/en/components/button", "native"],
    ["/components/zz-unknown", "native"],
    ["/components/zz-unknown", "web"],
    ["/fr/components/zz-unknown", "native"],
  ])("leaves %s?platform=%s on the clean page", (pathname, platform) => {
    expect(variantPathname(pathname, platform)).toBeUndefined();
  });
});

describe("publicVariant", () => {
  it.each([
    ["/p/native/components/button", "/components/button", "native"],
    ["/p/web/components", "/components", "web"],
    ["/fr/p/native/families/ai", "/fr/families/ai", "native"],
    ["/en/p/native/docs/installation", "/docs/installation", "native"],
  ])("maps %s back to its public URL", (pathname, expected, platform) => {
    expect(publicVariant(pathname)).toEqual({ pathname: expected, platform });
  });

  it.each([
    "/p/bogus/components",
    "/p/native",
    "/components/button",
    "/pricing",
    "/",
  ])("ignores %s", (pathname) => {
    expect(publicVariant(pathname)).toBeUndefined();
  });

  it("round-trips every rewrite", () => {
    const rewritten = variantPathname("/fr/components/button", "native");
    expect(rewritten && publicVariant(rewritten)).toEqual({
      pathname: "/fr/components/button",
      platform: "native",
    });
  });
});

describe("publicPagePathname", () => {
  it.each([
    ["/p/native/components/button", "/components/button"],
    ["/p/web/components", "/components"],
    ["/en/p/native/docs/installation", "/docs/installation"],
    ["/fr/p/native/families/ai", "/fr/families/ai"],
    ["/components/button", "/components/button"],
    ["/fr/components/button", "/fr/components/button"],
    ["/", "/"],
    ["/pricing", "/pricing"],
  ])("renders %s as %s", (pathname, expected) => {
    expect(publicPagePathname(pathname)).toBe(expected);
  });
});
