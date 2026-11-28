import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The site shell is generic: it holds no brand, site list, URL, copy or footer
 * column of any site. Everything site-specific comes in through props, so a
 * site that is not the library's own can use the shell as it stands.
 *
 * This guard reads every file of every shell part (source, stories, mdx,
 * tests) and fails on the library's own brand name in any case, which also
 * covers its domain. Two spellings pass, and no others:
 *
 * - `@vllnt/ui`, the import path of the package itself (mdx Import sections).
 * - `vllnt-` as a class prefix, the library's own utility prefix (for example
 *   `vllnt-glass`). The shell uses none today; the allowance exists so a
 *   library class is never mistaken for a brand.
 */
const SRC = join(__dirname, "..");

const SHELL_PATHS = [
  "components/atoms/site-main",
  "components/atoms/skip-link",
  "components/molecules/site-footer",
  "components/molecules/site-frame",
  "components/molecules/theme-bar",
  "components/organisms/site-header",
  "components/organisms/site-header-static",
  "components/templates/site-shell",
  "components/templates/site-shell-static",
  "lib/shell-layout.ts",
  "lib/shell-material.ts",
] as const;

/** This file names the brand to forbid it, so the scan skips it. */
const THIS_FILE = "components/shell-brand-guard.test.ts";

const ALLOWED = [/@vllnt\/ui\b/g, /\bvllnt-(?=[a-z])/g];

/** The brand spellings left in `source` after the allowed ones come out. */
function findBrandHits(source: string): string[] {
  const stripped = ALLOWED.reduce(
    (text, allowed) => text.replace(allowed, ""),
    source,
  );
  return stripped
    .split("\n")
    .flatMap((line, index) =>
      /vllnt/i.test(line) ? [`line ${index + 1}: ${line.trim()}`] : [],
    );
}

function listFiles(path: string): string[] {
  const stats = statSync(path);
  if (!stats.isDirectory()) return [path];
  return readdirSync(path).flatMap((entry) => listFiles(join(path, entry)));
}

const shellFiles = SHELL_PATHS.flatMap((path) =>
  listFiles(join(SRC, path)),
).filter((file) => relative(SRC, file) !== THIS_FILE);

describe("findBrandHits", () => {
  it.each([
    ["the brand name", 'const brand = "vllnt";'],
    ["the brand name in capitals", "VLLNT network"],
    ["a mixed-case brand name", "Vllnt"],
    ["the domain", 'href: "https://vllnt.com"'],
    ["a sub-domain", 'href: "https://ui.vllnt.com/r/x.json"'],
    ["a scoped name other than the package", "@vllnt/other"],
  ])("flags %s", (_name, source) => {
    expect(findBrandHits(source)).not.toHaveLength(0);
  });

  it.each([
    ["the package import path", "import { SiteShell } from '@vllnt/ui'"],
    ["a library class prefix", 'className="vllnt-glass"'],
    ["neutral sample data", 'brand="Acme" href="https://example.com"'],
  ])("allows %s", (_name, source) => {
    expect(findBrandHits(source)).toEqual([]);
  });

  it("reports the line of a hit", () => {
    expect(findBrandHits("a\nb\nconst x = 'vllnt'\n")).toEqual([
      "line 3: const x = 'vllnt'",
    ]);
  });
});

describe("site shell parts are generic", () => {
  it("reads the files of every shell part", () => {
    expect(shellFiles.length).toBeGreaterThan(30);
    expect(
      shellFiles.some((file) => file.endsWith("site-header/site-header.tsx")),
    ).toBe(true);
    expect(
      shellFiles.some((file) => file.endsWith("lib/shell-material.ts")),
    ).toBe(true);
  });

  it.each(shellFiles.map((file) => [relative(SRC, file), file]))(
    "%s holds no brand, domain or site data",
    (_name, file) => {
      expect(findBrandHits(readFileSync(file, "utf8"))).toEqual([]);
    },
  );
});
