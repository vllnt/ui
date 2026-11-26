#!/usr/bin/env node
// Writes the Markdown docs an AI agent reads from node_modules/@vllnt/<package>/.
//
//   node scripts/agent-docs.mjs write <ui|ui-core|ui-native>   (the package's prepack)
//   node scripts/agent-docs.mjs clean <ui|ui-core|ui-native>   (the package's postpack)
//
// Every publish path packs with `pnpm pack`, which runs prepack and postpack, so the
// docs land in the tarball without touching `build`. The written files are gitignored
// and removed again after packing. Each package gets an `llms.txt` index with relative
// links, so an agent reads the docs of the installed version, not the latest site.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ECOSYSTEM =
  "- [vllnt oss](https://oss.vllnt.com/llms.txt): every public @vllnt package, with what each one is for";

/** Per package: files copied in (repo path -> package path) and the llms.txt header. */
export const PACKAGES = {
  ui: {
    barrel: "src/components/index.ts",
    componentDocs: "src/components",
    metadata: "apps/registry/lib/component-metadata.json",
    copies: [["skills/vllnt-ui/SKILL.md", "skills/vllnt-ui/SKILL.md"]],
    directory: "packages/ui",
    docs: [
      ["README.md", "Install, theming, Tailwind setup and the full component list"],
      ["skills/vllnt-ui/SKILL.md", "Agent skill: choosing components and following the design tokens"],
      ["MIGRATION.md", "Breaking changes and how to migrate between versions"],
      ["CHANGELOG.md", "Release notes for every version"],
    ],
    generated: ["docs", "skills", "llms.txt"],
    summary:
      "React component library (Radix UI, Tailwind CSS, CVA). Import from `@vllnt/ui`; docs for the installed version are in this folder.",
    title: "@vllnt/ui",
  },
  "ui-core": {
    copies: [],
    directory: "packages/ui-core",
    docs: [
      ["README.md", "Install and use the tokens, native themes and option unions"],
      ["tokens.json", "Design tokens (schema: tokens.schema.json)"],
      ["component-contracts.json", "Portable component contracts (schema: component-contracts.schema.json)"],
      ["CHANGELOG.md", "Release notes for every version"],
    ],
    generated: ["llms.txt"],
    summary:
      "Platform-neutral design tokens and component contracts shared by @vllnt/ui (web) and @vllnt/ui-native.",
    title: "@vllnt/ui-core",
  },
  "ui-native": {
    copies: [["docs/native/PARITY.md", "docs/PARITY.md"]],
    directory: "packages/ui-native",
    docs: [
      ["README.md", "Install, peers and local use in Expo and React Native"],
      ["registry.json", "Every native component module (schema: registry.schema.json)"],
      ["docs/PARITY.md", "Web vs native status of every component and the known props gaps"],
      ["CHANGELOG.md", "Release notes for every version"],
    ],
    generated: ["docs", "llms.txt"],
    summary:
      "Accessible React Native components that share the VLLNT UI tokens and option names (pairs with @vllnt/ui-core).",
    title: "@vllnt/ui-native",
  },
};

/**
 * Turns a Storybook docs page into plain Markdown: drops the MDX imports and the
 * Storybook blocks (`<Meta />`, `<Canvas />`, `<Controls />`, ...), keeps text,
 * tables and code fences as written.
 */
export function mdxToMarkdown(source) {
  const lines = source.split("\n");
  const kept = [];
  let inFence = false;
  let inBlock = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence || /^\s*```/.test(line)) {
      kept.push(line);
      continue;
    }
    if (inBlock) {
      inBlock = !/\/>\s*$|<\/[A-Z][\w.]*>\s*$/.test(line);
      continue;
    }
    if (/^(import|export) /.test(line)) continue;
    if (/^\s*<\/?[A-Z]/.test(line)) {
      inBlock = !/\/>\s*$|<\/[A-Z][\w.]*>\s*$|^\s*<\/[A-Z]/.test(line);
      continue;
    }
    kept.push(line);
  }
  return `${kept.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

/** Title (`# heading`) and the first paragraph after it. */
export function describe(markdown) {
  const title = /^# (.+)$/m.exec(markdown)?.[1].trim();
  const afterTitle = title ? markdown.slice(markdown.indexOf(`# ${title}`) + title.length + 2) : markdown;
  const paragraph = afterTitle
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block && !/^[#`|<>-]/.test(block));
  return { summary: paragraph?.replace(/\s+/g, " "), title };
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

/** Value exports of the barrel, grouped by component folder (`atoms/button`). */
export function barrelExports(barrel) {
  const folders = new Map();
  for (const [, names, from] of barrel.matchAll(/export\s*\{([^}]*)\}\s*from\s*"\.\/([^"]+)"/g)) {
    const folder = from.split("/").slice(0, 2).join("/");
    const values = names
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name && !name.startsWith("type "))
      .map((name) => name.split(/\s+as\s+/).at(-1));
    folders.set(folder, [...(folders.get(folder) ?? []), ...values]);
  }
  return folders;
}

/** The page for a component folder with no Storybook docs page: summary, import, install. */
export function fallbackPage(folder, values, meta = {}) {
  const slug = folder.split("/")[1];
  const lines = [`# ${meta.title ?? slug}`, ""];
  if (meta.description) lines.push(meta.description, "");
  lines.push("## Import", "", "```tsx", `import { ${values.join(", ")} } from '@vllnt/ui'`, "```", "");
  lines.push("## Installation", "", "```bash", `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/${slug}.json`, "```", "");
  lines.push("## API Reference", "", "Props are typed in `dist/index.d.ts` (search for the component name).");
  return `${lines.join("\n")}\n`;
}

/**
 * One page per Storybook docs page, plus a fallback page for every barrel folder
 * that has none, so each exported component has a page. Sorted by path.
 */
export function planComponentDocs(packageDirectory, config, metadata = {}) {
  const sourceDirectory = join(packageDirectory, config.componentDocs);
  const page = (group, file, markdown) => ({
    group,
    markdown,
    path: join("docs", "components", `${file}.md`),
    ...describe(markdown),
  });
  const pages = walk(sourceDirectory)
    .filter((path) => path.endsWith(".mdx"))
    .map((path) => {
      const [group, folder] = relative(sourceDirectory, path).split("/");
      return { folder: `${group}/${folder}`, ...page(group, basename(path, ".mdx"), mdxToMarkdown(readFileSync(path, "utf8"))) };
    });
  const documented = new Set(pages.map((entry) => entry.folder));
  const barrel = barrelExports(readFileSync(join(packageDirectory, config.barrel), "utf8"));
  for (const [folder, values] of barrel) {
    if (documented.has(folder) || values.length === 0) continue;
    const [group, slug] = folder.split("/");
    pages.push({ folder, ...page(group, slug, fallbackPage(folder, values, metadata[slug])) });
  }
  pages.sort((a, b) => a.path.localeCompare(b.path));
  const paths = pages.map((entry) => entry.path);
  const duplicate = paths.find((path, index) => paths.indexOf(path) !== index);
  if (duplicate) throw new Error(`Two component docs write ${duplicate}`);
  return pages;
}

/** The llms.txt index (https://llmstxt.org), with links relative to the package root. */
export function renderLlms(config, pages = []) {
  const sections = [
    `# ${config.title}`,
    `> ${config.summary}`,
    "## Docs",
    config.docs.map(([path, note]) => `- [${path}](./${path}): ${note}`).join("\n"),
  ];
  const levels = ["atoms", "molecules", "organisms", "templates"];
  const rank = (group) => (levels.includes(group) ? levels.indexOf(group) : levels.length);
  const groups = [...new Set(pages.map((page) => page.group))].sort(
    (a, b) => rank(a) - rank(b) || a.localeCompare(b),
  );
  for (const group of groups) {
    const heading = group.charAt(0).toUpperCase() + group.slice(1);
    const items = pages
      .filter((page) => page.group === group)
      .map((page) => `- [${page.title ?? basename(page.path, ".md")}](./${page.path})${page.summary ? `: ${page.summary}` : ""}`);
    sections.push(`## Components: ${heading}`, items.join("\n"));
  }
  sections.push("## Ecosystem", ECOSYSTEM);
  return `${sections.join("\n\n")}\n`;
}

/** Registry titles and descriptions by component name, for the fallback pages. */
export function readMetadata(config) {
  return config.metadata ? JSON.parse(readFileSync(join(root, config.metadata), "utf8")) : {};
}

export function clean(config, packageDirectory = join(root, config.directory)) {
  for (const path of config.generated) rmSync(join(packageDirectory, path), { force: true, recursive: true });
}

export function write(config, packageDirectory = join(root, config.directory)) {
  clean(config, packageDirectory);
  for (const [from, to] of config.copies) {
    mkdirSync(dirname(join(packageDirectory, to)), { recursive: true });
    cpSync(join(root, from), join(packageDirectory, to));
  }
  const pages = config.componentDocs
    ? planComponentDocs(packageDirectory, config, readMetadata(config))
    : [];
  for (const page of pages) {
    mkdirSync(dirname(join(packageDirectory, page.path)), { recursive: true });
    writeFileSync(join(packageDirectory, page.path), page.markdown);
  }
  writeFileSync(join(packageDirectory, "llms.txt"), renderLlms(config, pages));
  return pages.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, name] = process.argv.slice(2);
  const config = PACKAGES[name];
  if (!config || !["clean", "write"].includes(command)) {
    console.error(`Usage: agent-docs.mjs <write|clean> <${Object.keys(PACKAGES).join("|")}>`);
    process.exit(1);
  }
  if (command === "clean") clean(config);
  else console.log(`${config.title}: wrote llms.txt and ${write(config)} component docs`);
}
