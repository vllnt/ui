import { cfBeaconTag } from "../.storybook/cf-beacon";

describe("Storybook Cloudflare beacon", () => {
  it("renders the beacon tag for a valid site token", () => {
    expect(cfBeaconTag("0123456789abcdef0123456789abcdef")).toBe(
      `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"0123456789abcdef0123456789abcdef"}'></script>`,
    );
  });

  it.each([
    undefined,
    "",
    "abc",
    `0123456789abcdef0123456789abcdef'><img src=x>`,
  ])("renders nothing for %j, so no markup can be injected", (value) => {
    expect(cfBeaconTag(value)).toBe("");
  });
});
