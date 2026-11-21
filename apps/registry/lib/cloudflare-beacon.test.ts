import { createElement } from "react";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CloudflareBeacon } from "../components/cloudflare-beacon";

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

describe("CloudflareBeacon", () => {
  const BEACON_TAG = /<script[^>]+static\.cloudflareinsights\.com\/beacon/g;

  it("renders exactly one beacon script when the token is set", () => {
    const html = renderToStaticMarkup(
      createElement(CloudflareBeacon, { token: SITE }),
    );

    expect(html.match(BEACON_TAG)).toHaveLength(1);
    expect(html).toContain(
      `data-cf-beacon="{&quot;token&quot;:&quot;${SITE}&quot;}"`,
    );
    expect(html).toContain("defer");
  });

  it("renders nothing when the token is unset", () => {
    expect(
      renderToStaticMarkup(
        createElement(CloudflareBeacon, { token: undefined }),
      ),
    ).toBe("");
  });
});
