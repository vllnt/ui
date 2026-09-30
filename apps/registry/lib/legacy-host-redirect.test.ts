import { describe, expect, it } from "vitest";

import {
  CANONICAL_HOST,
  LEGACY_HOST,
  legacyHostRedirectUrl,
} from "./legacy-host-redirect";

describe("legacyHostRedirectUrl", () => {
  it.each([
    // Preserves path and query.
    { host: LEGACY_HOST, path: "/components/button", query: "?tab=code" },
    // Redirects the root path.
    { host: LEGACY_HOST, path: "/", query: "" },
    // Case-insensitive; ignores a port on the host.
    { host: "UI.VLLNT.AI:443", path: "/x", query: "" },
  ])(
    "redirects $host$path$query to the canonical host",
    ({ host, path, query }) => {
      expect(legacyHostRedirectUrl(host, path, query)).toBe(
        `https://${CANONICAL_HOST}${path}${query}`,
      );
    },
  );

  it.each([
    CANONICAL_HOST,
    "pr-42-ui-registry.preview.vllnt.ai",
    "localhost:3000",
    undefined,
  ])("does not redirect host %s", (host) => {
    expect(legacyHostRedirectUrl(host, "/", "")).toBeUndefined();
  });
});
