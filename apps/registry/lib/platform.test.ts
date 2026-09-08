import { describe, expect, it } from "vitest";

import { getPlatform, withPlatformQuery } from "@/lib/platform";

describe("getPlatform", () => {
  it("defaults page context to web", () => {
    expect(getPlatform()).toBe("web");
    expect(getPlatform("unknown")).toBe("web");
  });

  it("uses the first repeated platform consistently with URLSearchParams", () => {
    const query = new URLSearchParams("platform=native&platform=web");
    expect(getPlatform(query.getAll("platform"), "all")).toBe("native");
    expect(getPlatform(query.getAll("platform"), "all")).toBe(
      getPlatform(query.get("platform") ?? undefined, "all"),
    );
  });

  it("allows the catalog to retain All", () => {
    expect(getPlatform(undefined, "all")).toBeUndefined();
  });
});

describe("withPlatformQuery", () => {
  it("preserves unrelated and repeated query parameters", () => {
    expect(
      withPlatformQuery(
        "/components/button?view=details#installation",
        { ref: "header", tag: ["a", "b"] },
        "native",
      ),
    ).toBe(
      "/components/button?ref=header&tag=a&tag=b&view=details&platform=native#installation",
    );
  });

  it("removes only platform for the All catalog", () => {
    expect(
      withPlatformQuery(
        "/components",
        { platform: "native", search: "button" },
        "all",
      ),
    ).toBe("/components?search=button");
  });
});
