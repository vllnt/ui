/**
 * Component SEO MDX scaffolder.
 *
 * Generates a baseline English `content/components/<slug>/en.mdx` for every
 * registry component from existing metadata (title, description, category,
 * story data) so every component page ships unique, crawlable prose that embeds
 * the live kit (`<Preview>`, `<Install>`, `<Code>`, `<Stories>`). Existing files
 * are left untouched (hand-authored content wins); pass `--force` to overwrite.
 * French is produced by translating each en.mdx (see the fr translation step).
 *
 * Usage: pnpm -F @vllnt/ui-registry components:generate-mdx [--force]
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const REGISTRY_ROOT = path.join(import.meta.dirname, "..");
const CONTENT_DIR = path.join(REGISTRY_ROOT, "content", "components");
const FORCE = process.argv.includes("--force");

type RegistryItem = {
  categories?: string[];
  description?: string;
  name: string;
  title?: string;
  type: string;
};

type Meta = { category?: string; description?: string; title?: string };

const registry = JSON.parse(
  readFileSync(path.join(REGISTRY_ROOT, "registry.json"), "utf8"),
) as { items: RegistryItem[] };

const metadata = JSON.parse(
  readFileSync(path.join(REGISTRY_ROOT, "lib", "component-metadata.json"), "utf8"),
) as Record<string, Meta>;

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function buildMdx(item: RegistryItem): string {
  const meta = metadata[item.name] ?? {};
  const title = meta.title ?? item.title ?? item.name;
  const baseDescription =
    meta.description ?? item.description ?? `${title} component for VLLNT UI.`;
  const category = meta.category ?? item.categories?.[0] ?? "ui";
  const description = `${baseDescription} Install ${title} from the VLLNT UI registry with the shadcn CLI.`;
  const keywords = unique([
    item.name,
    `${item.name} component`,
    `react ${item.name}`,
    `shadcn ${item.name}`,
    `${category} component`,
  ]);

  const keywordLines = keywords
    .map((keyword) => `  - ${JSON.stringify(keyword)}`)
    .join("\n");

  return `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
keywords:
${keywordLines}
---

${baseDescription} Part of the ${category} family in VLLNT UI, it ships as a
machine-readable registry entry — copy the source directly into your app with
the shadcn CLI and own it, no runtime dependency on a component library.

<Preview />

## Installation

Add ${title} to your project with the shadcn CLI. The source lands in your
codebase, ready to adapt:

<Install />

## Source

<Code />

## Stories

Explore every variant and state in the interactive Storybook:

<Stories />
`;
}

function main(): void {
  const components = registry.items
    .filter((item) => item.type === "registry:component")
    .sort((a, b) => a.name.localeCompare(b.name));

  let written = 0;
  let skipped = 0;
  for (const item of components) {
    const dir = path.join(CONTENT_DIR, item.name);
    const file = path.join(dir, "en.mdx");
    try {
      readFileSync(file);
      if (!FORCE) {
        skipped += 1;
        continue;
      }
    } catch {
      // missing — generate
    }
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, buildMdx(item));
    written += 1;
  }

  console.log(
    `components:generate-mdx — ${components.length} components: ${written} written, ${skipped} skipped (existing).`,
  );
}

main();
