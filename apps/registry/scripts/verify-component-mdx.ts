/**
 * Component SEO MDX verifier.
 *
 * Every registry component must ship a hand-ownable, localized SEO page at
 * `content/components/<slug>/<locale>.mdx`. This gate fails the build when a
 * component page would fall back to the thin data-driven shell or drop a
 * required block, so SEO coverage can't silently regress:
 *
 *   - every component has an .mdx in every locale
 *   - each file has frontmatter `title` + `description`
 *   - each file embeds the live `<Preview />` block (the SEO differentiator)
 *
 * Usage: pnpm -F @vllnt/ui-registry components:verify-mdx
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const REGISTRY_ROOT = path.join(import.meta.dirname, "..");
const CONTENT_DIR = path.join(REGISTRY_ROOT, "content", "components");

/** Blocks every localized component page must embed. Extend to enforce more. */
const REQUIRED_BLOCKS = [
  "<Preview",
  "<Install",
  "<Code",
  "<Stories",
] as const;

type Registry = {
  items: { name: string; type: string }[];
};

function readLocales(): string[] {
  const source = readFileSync(
    path.join(REGISTRY_ROOT, "i18n", "locales.ts"),
    "utf8",
  );
  const body = /locales\s*=\s*\[([^\]]+)\]/.exec(source)?.[1] ?? "";
  return [...body.matchAll(/"([^"]+)"/g)].map((match) => match[1]!);
}

function componentSlugs(): string[] {
  const registry = JSON.parse(
    readFileSync(path.join(REGISTRY_ROOT, "registry.json"), "utf8"),
  ) as Registry;
  return registry.items
    .filter((item) => item.type === "registry:component")
    .map((item) => item.name)
    .sort();
}

function main(): void {
  const locales = readLocales();
  const slugs = componentSlugs();
  const failures: string[] = [];

  for (const slug of slugs) {
    for (const locale of locales) {
      const file = path.join(CONTENT_DIR, slug, `${locale}.mdx`);
      let raw: string;
      try {
        raw = readFileSync(file, "utf8");
      } catch {
        failures.push(`${slug}: missing ${locale}.mdx`);
        continue;
      }

      const { content, data } = matter(raw);
      if (typeof data.title !== "string" || data.title.length === 0) {
        failures.push(`${slug}/${locale}.mdx: missing frontmatter "title"`);
      }
      if (typeof data.description !== "string" || data.description.length === 0) {
        failures.push(
          `${slug}/${locale}.mdx: missing frontmatter "description"`,
        );
      }
      for (const block of REQUIRED_BLOCKS) {
        if (!content.includes(block)) {
          failures.push(`${slug}/${locale}.mdx: missing required ${block}> block`);
        }
      }
    }
  }

  console.log(
    `components:verify-mdx — ${slugs.length} components x ${locales.length} locales (${locales.join(", ")})`,
  );
  if (failures.length === 0) {
    console.log("All component pages have complete, localized SEO MDX.");
    return;
  }

  console.error(`\n${failures.length} issue(s):`);
  for (const failure of failures.slice(0, 60)) console.error(`  - ${failure}`);
  if (failures.length > 60) console.error(`  … and ${failures.length - 60} more`);
  process.exit(1);
}

main();
