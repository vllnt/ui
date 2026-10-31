import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const SKIPPED = /\.(stories|test|visual|visual\.fixture|spec)\.tsx$/;
const SVG_OPEN_TAG = /<svg\b[^>]*>/gs;
const NAMED_OR_FORWARDED = /aria-hidden|aria-label|role=|<title|{\.\.\./;

function listSources(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return listSources(path);
    return path.endsWith(".tsx") && !SKIPPED.test(path) ? [path] : [];
  });
}

describe("inline svg accessibility", () => {
  it("hides decorative inline svg from assistive technology", () => {
    const offenders = listSources(__dirname).flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(SVG_OPEN_TAG)]
        .filter(([tag]) => !NAMED_OR_FORWARDED.test(tag))
        .map(() => relative(__dirname, path)),
    );

    expect(offenders).toEqual([]);
  });
});
