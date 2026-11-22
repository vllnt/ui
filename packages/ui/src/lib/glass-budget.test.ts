import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { block, readTheme } from "./__tests__/theme-colors";

/*
 * The backdrop-filter budget of DESIGN.md ("Glass material"), as a static
 * check of the source: no blur above the blur.glass.lg token (24 px), no blur
 * that skips the tokens, every glass surface switchable to solid. The count of
 * blurred layers on screen at once is a design rule, not something source can
 * prove.
 */

const REPOSITORY = join(import.meta.dirname, "..", "..", "..", "..");

const ROOTS = [
  "packages/ui/src",
  "packages/ui/themes",
  "packages/ui/styles.css",
  "apps/registry/app",
  "apps/registry/components",
];

const SKIPPED_DIRECTORIES = new Set([".next", "dist", "node_modules"]);

const SKIPPED_FILES = /\.(?:stories|test|visual)\.[jt]sx?$|\.d\.ts$/;

const SOURCE_FILES = /\.(?:css|ts|tsx)$/;

function sourceFiles(path: string): string[] {
  const absolute = join(REPOSITORY, path);
  const entries = readdirSync(absolute, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      return SKIPPED_DIRECTORIES.has(entry.name) ? [] : sourceFiles(child);
    }
    return SOURCE_FILES.test(entry.name) && !SKIPPED_FILES.test(entry.name)
      ? [child]
      : [];
  });
}

function collect(): string[] {
  return ROOTS.flatMap((root) =>
    SOURCE_FILES.test(root) ? [root] : sourceFiles(root),
  );
}

const FILES = collect();

const read = (path: string): string =>
  readFileSync(join(REPOSITORY, path), "utf8");

const INNER = "[^()]*";
const NESTED_ONCE = `(?:[^()]|\\(${INNER}\\))*`;
const NESTED_TWICE = `(?:[^()]|\\(${NESTED_ONCE}\\))*`;

/** `blur(...)` with up to three levels of parentheses, as in `blur(calc(var(--x) * 2))`. */
const BLUR_CALL = new RegExp(`blur\\(${NESTED_TWICE}\\)`, "g");

const blurCalls = (source: string): string[] => source.match(BLUR_CALL) ?? [];

/** A `@supports` condition names `blur(1px)` to test for support; it draws nothing. */
const withoutFeatureQueries = (source: string): string =>
  source.replaceAll(/@supports[^{]*/g, "");

const GLASS_CLASS = /vllnt-glass(?:-floating|-scrim)?(?=[\s"'`])/;

describe("glass backdrop-filter budget", () => {
  it("scans the library and the registry sources", () => {
    expect(FILES.length).toBeGreaterThan(300);
    expect(FILES).toContain("packages/ui/styles.css");
  });

  it("uses no raw backdrop-blur-* class: blur comes from the glass tokens", () => {
    const offenders = FILES.filter((file) =>
      /\bbackdrop-blur\b|\bbackdrop-blur-[\w./[\]]+/.test(read(file)),
    );
    expect(offenders).toEqual([]);
  });

  it("blurs a backdrop only through a --blur-glass-* token", () => {
    const offenders = FILES.filter((file) =>
      /backdrop-?filter/i.test(read(file)),
    ).flatMap((file) =>
      blurCalls(withoutFeatureQueries(read(file)))
        .filter(
          (call) =>
            !call.includes("--blur-glass-") &&
            !call.includes("--vllnt-glass-blur"),
        )
        .map((call) => `${file}: ${call}`),
    );
    expect(offenders).toEqual([]);
  });

  it("points --vllnt-glass-blur at a --blur-glass-* token only", () => {
    const css = read("packages/ui/styles.css");
    const values = [...css.matchAll(/--vllnt-glass-blur:\s*([^;]+);/g)].map(
      ([, value = ""]) => value.trim(),
    );
    expect(values.length).toBeGreaterThan(0);
    expect(
      values.filter(
        (value) => !/^var\(--blur-glass-(?:default|lg|md|sm)\)$/.test(value),
      ),
    ).toEqual([]);
  });

  it("keeps every blur token at or below blur.glass.lg, 24 px", () => {
    const root = block(readTheme("default.css"), ":root");
    const radii = Object.entries(root)
      .filter(([name]) => name.startsWith("blur-glass-"))
      .map(([name, value]) => [name, Number.parseFloat(value)] as const);
    expect(radii.map(([name]) => name).sort()).toEqual([
      "blur-glass-default",
      "blur-glass-lg",
      "blur-glass-md",
      "blur-glass-sm",
    ]);
    expect(
      radii.filter(([, radius]) => radius > 24).map(([name]) => name),
    ).toEqual([]);
    expect(root["blur-glass-lg"]).toBe("24px");
  });

  it("gives every library glass surface a material prop that reaches data-material", () => {
    const missing = FILES.filter(
      (file) =>
        file.startsWith("packages/ui/src/") &&
        file.endsWith(".tsx") &&
        GLASS_CLASS.test(read(file)),
    ).filter((file) => !read(file).includes("data-material"));
    expect(missing).toEqual([]);
  });
});
