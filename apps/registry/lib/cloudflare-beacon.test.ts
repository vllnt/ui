import { describe, expect, it } from "vitest";

import { cloudflareBeaconToken } from "./cloudflare-beacon";

describe("cloudflareBeaconToken", () => {
  it("accepts a 32-character hex site token", () => {
    expect(cloudflareBeaconToken("0123456789abcdef0123456789ABCDEF")).toBe(
      "0123456789abcdef0123456789ABCDEF",
    );
    expect(cloudflareBeaconToken(" 0123456789abcdef0123456789abcdef\n")).toBe(
      "0123456789abcdef0123456789abcdef",
    );
  });

  it.each([
    undefined,
    "",
    "   ",
    "0123456789abcdef",
    "0123456789abcdef0123456789abcdefXX",
    `0123456789abcdef0123456789abcde"`,
    "'><script>alert(1)</script>",
  ])("loads nothing for %j", (value) => {
    expect(cloudflareBeaconToken(value)).toBeUndefined();
  });
});
