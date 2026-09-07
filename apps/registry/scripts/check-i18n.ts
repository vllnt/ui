/**
 * i18n drift check.
 *
 * A locale is only "supported" if every surface actually ships that language.
 * This script fails the build when the translation surfaces drift apart, so a
 * new locale can be added by editing `i18n/locales.ts` + filling the surfaces,
 * and CI proves the fill is complete. Three invariants are enforced:
 *
 *   1. Message parity   - every `messages/<locale>.json` has the exact same leaf
 *      key set as the default locale (no missing / no extra keys).
 *   2. MDX coverage      - every translatable page under `content/pages/` exists
 *      in every locale (no silent English fallback), and no legacy flat
 *      `<slug>.mdx` files remain (they must be `<slug>/<locale>.mdx` folders).
 *   3. Message wiring    - every top-level message namespace is actually consumed
 *      by a `useTranslations` / `getTranslations` call, and every referenced
 *      namespace is defined. Dead namespaces are drift waiting to happen.
 *
 * Usage: pnpm -F @vllnt/ui-registry i18n:check
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const REGISTRY_ROOT = path.join(import.meta.dirname, "..");
const MESSAGES_DIR = path.join(REGISTRY_ROOT, "messages");
const CONTENT_DIR = path.join(REGISTRY_ROOT, "content", "pages");
const SOURCE_DIRS = ["app", "components", "lib"].map((directory) =>
  path.join(REGISTRY_ROOT, directory),
);

/**
 * Namespaces that are intentionally consumed dynamically (never as a literal
 * `useTranslations("x")`) or reserved for a not-yet-wired surface. Keep empty;
 * add a slug only with a comment explaining why the wiring check can't see it.
 */
const NAMESPACE_USAGE_ALLOWLIST: readonly string[] = [];

type Failure = { readonly check: string; readonly message: string };

const failures: Failure[] = [];

function fail(check: string, message: string): void {
  failures.push({ check, message });
}

function readLocales(): { defaultLocale: string; locales: string[] } {
  const source = readFileSync(
    path.join(REGISTRY_ROOT, "i18n", "locales.ts"),
    "utf8",
  );
  const localesBody = /locales\s*=\s*\[([^\]]+)\]/.exec(source)?.[1];
  const defaultLocale = /defaultLocale\s*=\s*"([^"]+)"/.exec(source)?.[1];
  if (!localesBody || !defaultLocale) {
    throw new Error("Unable to parse i18n/locales.ts");
  }
  const locales = [...localesBody.matchAll(/"([^"]+)"/g)]
    .map((entry) => entry[1])
    .filter((value): value is string => value !== undefined);
  return { defaultLocale, locales };
}

function collectLeafKeys(value: unknown, prefix: string, keys: Set<string>): void {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      collectLeafKeys(child, prefix ? `${prefix}.${key}` : key, keys);
    }
    return;
  }
  keys.add(prefix);
}

function loadMessages(locale: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(path.join(MESSAGES_DIR, `${locale}.json`), "utf8"),
  ) as Record<string, unknown>;
}

function checkMessageParity(defaultLocale: string, locales: string[]): void {
  const defaultKeys = new Set<string>();
  collectLeafKeys(loadMessages(defaultLocale), "", defaultKeys);

  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    const keys = new Set<string>();
    collectLeafKeys(loadMessages(locale), "", keys);

    const missing = [...defaultKeys].filter((key) => !keys.has(key));
    const extra = [...keys].filter((key) => !defaultKeys.has(key));

    for (const key of missing) {
      fail("message-parity", `${locale}.json is missing key "${key}"`);
    }
    for (const key of extra) {
      fail(
        "message-parity",
        `${locale}.json has extra key "${key}" not in ${defaultLocale}.json`,
      );
    }
  }
}

function listPageDirectories(directory: string, pages: Set<string>): void {
  const entries = readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      listPageDirectories(entryPath, pages);
      continue;
    }
    if (!entry.name.endsWith(".mdx")) continue;

    const base = entry.name.replace(/\.mdx$/, "");
    const isLocaleFile = /^[a-z]{2}(-[A-Z]{2})?$/.test(base);
    if (isLocaleFile) {
      pages.add(directory);
    } else {
      const relative = path.relative(CONTENT_DIR, entryPath);
      fail(
        "mdx-coverage",
        `flat content file "${relative}" must be a folder: ${base}/<locale>.mdx`,
      );
    }
  }
}

function checkMdxCoverage(locales: string[]): void {
  const pages = new Set<string>();
  listPageDirectories(CONTENT_DIR, pages);

  for (const pageDir of [...pages].sort()) {
    const relative = path.relative(CONTENT_DIR, pageDir);
    const present = new Set(
      readdirSync(pageDir)
        .filter((name) => name.endsWith(".mdx"))
        .map((name) => name.replace(/\.mdx$/, "")),
    );
    for (const locale of locales) {
      if (!present.has(locale)) {
        fail(
          "mdx-coverage",
          `page "${relative}" is missing ${locale}.mdx (present: ${[...present].join(", ")})`,
        );
      }
    }
  }
}

function walkSourceFiles(directory: string, files: string[]): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walkSourceFiles(entryPath, files);
      continue;
    }
    if (/\.(tsx?|mdx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(entryPath);
    }
  }
}

function checkMessageWiring(defaultLocale: string): void {
  const topLevelNamespaces = Object.keys(loadMessages(defaultLocale));

  const files: string[] = [];
  for (const directory of SOURCE_DIRS) {
    try {
      statSync(directory);
      walkSourceFiles(directory, files);
    } catch {
      // directory absent - skip
    }
  }

  const referencedNamespaces = new Set<string>();
  const namespacePattern =
    /(?:useTranslations|getTranslations)\(\s*(?:\{[^}]*namespace:\s*)?["'`]([\w.]+)["'`]/g;
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(namespacePattern)) {
      const reference = match[1];
      if (reference) {
        referencedNamespaces.add(reference.split(".")[0] ?? reference);
      }
    }
  }

  for (const namespace of topLevelNamespaces) {
    if (referencedNamespaces.has(namespace)) continue;
    if (NAMESPACE_USAGE_ALLOWLIST.includes(namespace)) continue;
    fail(
      "message-wiring",
      `namespace "${namespace}" is defined in ${defaultLocale}.json but never consumed by useTranslations/getTranslations (dead translation)`,
    );
  }

  for (const namespace of referencedNamespaces) {
    if (!topLevelNamespaces.includes(namespace)) {
      fail(
        "message-wiring",
        `namespace "${namespace}" is referenced in source but not defined in ${defaultLocale}.json`,
      );
    }
  }
}

function main(): void {
  const { defaultLocale, locales } = readLocales();
  console.log(`i18n:check - locales: ${locales.join(", ")} (default: ${defaultLocale})`);

  checkMessageParity(defaultLocale, locales);
  checkMdxCoverage(locales);
  checkMessageWiring(defaultLocale);

  if (failures.length === 0) {
    console.log("i18n surfaces are in parity across all locales.");
    return;
  }

  const byCheck = new Map<string, string[]>();
  for (const failure of failures) {
    const list = byCheck.get(failure.check) ?? [];
    list.push(failure.message);
    byCheck.set(failure.check, list);
  }
  for (const [check, messages] of byCheck) {
    console.error(`\n[${check}] ${messages.length} issue(s):`);
    for (const message of messages) console.error(`  - ${message}`);
  }
  console.error(`\ni18n:check failed with ${failures.length} issue(s).`);
  process.exit(1);
}

main();
