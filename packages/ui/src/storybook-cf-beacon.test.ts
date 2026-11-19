import { cfBeaconTag } from "../.storybook/cf-beacon";

/** A fake site token with the real shape (32 hex), built so no scanner reads it as a credential. */
const SITE = "ab".repeat(16);

describe("Storybook Cloudflare beacon", () => {
  it("renders the beacon tag for a valid site token", () => {
    expect(cfBeaconTag(SITE)).toBe(
      `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${SITE}"}'></script>`,
    );
  });

  it.each([undefined, "", "abc", `${SITE}'><img src=x>`])(
    "renders nothing for %j, so no markup can be injected",
    (value) => {
      expect(cfBeaconTag(value)).toBe("");
    },
  );
});
