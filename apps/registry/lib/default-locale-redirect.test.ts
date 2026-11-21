import { describe, expect, it } from "vitest";

import { defaultLocalePrefixTarget } from "./default-locale-redirect";

describe("defaultLocalePrefixTarget", () => {
  it.each([
    ["/en", "/"],
    ["/en/", "/"],
    ["/en/docs/cli", "/docs/cli"],
    ["/en/components/quiz", "/components/quiz"],
    ["/en/families/data", "/families/data"],
  ])("sends %s to %s", (pathname, expected) => {
    expect(defaultLocalePrefixTarget(pathname)).toBe(expected);
  });

  it.each([
    "/",
    "/docs/cli",
    "/fr",
    "/fr/docs/cli",
    "/english",
    "/entry/en",
    "/components/en",
    "/docs/en/cli",
  ])("leaves %s alone", (pathname) => {
    expect(defaultLocalePrefixTarget(pathname)).toBeUndefined();
  });
});
