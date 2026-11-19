import { describe, expect, it } from "vitest";

import { cloudflareBeaconToken } from "./cloudflare-beacon";

/** A fake site token with the real shape (32 hex), built so no scanner reads it as a credential. */
const SITE = "ab".repeat(16);

describe("cloudflareBeaconToken", () => {
  it("accepts a 32-character hex site token", () => {
    expect(cloudflareBeaconToken(SITE.toUpperCase())).toBe(SITE.toUpperCase());
    expect(cloudflareBeaconToken(` ${SITE}\n`)).toBe(SITE);
  });

  it.each([
    undefined,
    "",
    "   ",
    SITE.slice(16),
    `${SITE}XX`,
    `${SITE.slice(1)}"`,
    "'><script>alert(1)</script>",
  ])("loads nothing for %j", (value) => {
    expect(cloudflareBeaconToken(value)).toBeUndefined();
  });
});
