import { describe, expect, it } from "vitest";

import {
  canonicalPlatformPath,
  forwardedParameters,
  getPlatform,
  withPlatformQuery,
} from "@/lib/platform";

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

describe("forwardedParameters", () => {
  it("carries the native platform variant", () => {
    expect(
      forwardedParameters(new URLSearchParams("platform=native")).toString(),
    ).toBe("platform=native");
  });

  it("drops the web platform, which a clean URL already shows", () => {
    expect(
      forwardedParameters(new URLSearchParams("platform=web")).toString(),
    ).toBe("");
  });

  it("never carries component, ref or unknown parameters", () => {
    const query = new URLSearchParams(
      "component=button&ref=e2e&utm_source=x&platform=native&platform=web",
    );

    expect(forwardedParameters(query).toString()).toBe("platform=native");
    expect(
      forwardedParameters(
        new URLSearchParams("component=button&ref=e2e"),
      ).toString(),
    ).toBe("");
  });

  it("ignores an unknown platform value", () => {
    expect(
      forwardedParameters(new URLSearchParams("platform=bogus")).toString(),
    ).toBe("");
  });
});

describe("canonicalPlatformPath", () => {
  it("keeps the native variant, which has its own content", () => {
    expect(canonicalPlatformPath("/components", "native")).toBe(
      "/components?platform=native",
    );
    expect(canonicalPlatformPath("/docs/installation", "native")).toBe(
      "/docs/installation?platform=native",
    );
  });

  it("uses the clean URL for web and for the unfiltered view", () => {
    expect(canonicalPlatformPath("/components", "web")).toBe("/components");
    expect(
      canonicalPlatformPath("/components", getPlatform(undefined, "all")),
    ).toBe("/components");
    expect(canonicalPlatformPath("/docs/installation", "web")).toBe(
      "/docs/installation",
    );
  });
});
