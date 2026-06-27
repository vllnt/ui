import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";
import { registry } from "@/lib/registry";

/**
 * Regression guard for component-count drift.
 *
 * `registry.items.length` is the single source of truth for the number of
 * shipped components. Three human-maintained surfaces restate it as prose: the
 * changelog snapshot and the localized home copy (en and fr). They drifted to a
 * stale 225 while the registry grew to 309 — the homepage read the live count,
 * the prose did not. These tests fail the moment a restated count diverges from
 * the registry, so adding a component also updates the copy.
 *
 * The code surfaces (app/manifest.ts and app/mcp/route.ts) now derive the count
 * from the registry and cannot drift; this test pins the manifest to lock it in.
 */

const liveCount = registry.items.length;

const repoRoot = path.join(process.cwd(), "..", "..");
const homeDirectory = path.join(process.cwd(), "content", "pages", "home");

function read(filePath: string): string {
  return readFileSync(filePath, "utf8");
}

describe("component count stays consistent with the registry", () => {
  it("the newest CHANGELOG component-count snapshot matches the live count", () => {
    const changelog = read(path.join(repoRoot, "CHANGELOG.md"));
    // The count snapshot lives in the newest section that declares one:
    // [Unreleased] while changes are pending, or the dated release section
    // after a release cut. The file is newest-first, so the first match
    // is the current snapshot.
    const match = /total component count:\s*\*\*(\d+)\*\*/i.exec(changelog);
    expect(
      match,
      "CHANGELOG.md is missing a 'Total component count' line",
    ).not.toBeNull();
    expect(Number(match?.[1])).toBe(liveCount);
  });

  it.each(["en", "fr"])(
    "every count claim in home/%s.mdx matches the live count",
    (locale) => {
      const mdx = read(path.join(homeDirectory, `${locale}.mdx`));
      const claims = [
        ...mdx.matchAll(/(\d+)(?=[^\n]{0,30}(?:components|composants))/g),
      ].map((entry) => Number(entry[1]));

      expect(
        claims.length,
        `home/${locale}.mdx has no detectable component-count claim`,
      ).toBeGreaterThan(0);
      claims.forEach((claim) => {
        expect(claim).toBe(liveCount);
      });
    },
  );

  it("the PWA manifest description states the live count", () => {
    expect(manifest().description).toContain(String(liveCount));
  });
});
