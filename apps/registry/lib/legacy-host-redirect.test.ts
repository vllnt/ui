import { describe, expect, it } from "vitest";

import {
  CANONICAL_HOST,
  LEGACY_HOST,
  legacyHostRedirectUrl,
} from "./legacy-host-redirect";

describe("legacyHostRedirectUrl", () => {
  it("redirects the legacy host to canonical, preserving path and query", () => {
    expect(
      legacyHostRedirectUrl(LEGACY_HOST, "/components/button", "?tab=code"),
    ).toBe(`https://${CANONICAL_HOST}/components/button?tab=code`);
  });

  it("redirects the root path", () => {
    expect(legacyHostRedirectUrl(LEGACY_HOST, "/", "")).toBe(
      `https://${CANONICAL_HOST}/`,
    );
  });

  it("is case-insensitive and ignores a port on the host", () => {
    expect(legacyHostRedirectUrl("UI.VLLNT.AI:443", "/x", "")).toBe(
      `https://${CANONICAL_HOST}/x`,
    );
  });

  it("does not redirect the canonical host", () => {
    expect(legacyHostRedirectUrl(CANONICAL_HOST, "/", "")).toBeUndefined();
  });

  it("does not redirect preview or localhost hosts", () => {
    expect(
      legacyHostRedirectUrl("pr-42-ui-registry.preview.vllnt.ai", "/", ""),
    ).toBeUndefined();
    expect(legacyHostRedirectUrl("localhost:3000", "/", "")).toBeUndefined();
  });

  it("does not redirect when the host is missing", () => {
    expect(legacyHostRedirectUrl(undefined, "/", "")).toBeUndefined();
  });
});
