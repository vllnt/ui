import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  barrelExports,
  clean,
  describe,
  fallbackPage,
  mdxToMarkdown,
  PACKAGES,
  renderLlms,
  write,
} from "./agent-docs.mjs";

const BARREL = `export { Button, type ButtonProps, buttonVariants } from "./atoms/button/button";
export {
  AnimatedBeam,
  type AnimatedBeamProps,
} from "./atoms/animated-beam/animated-beam";
export { BarChart } from "./organisms/chart/bar-chart";
export { LineChart as Line } from "./organisms/chart/line-chart";
export { type OnlyTypes } from "./molecules/types-only/types-only";
`;

const STORYBOOK_PAGE = `import { Meta, Primary, Controls, Canvas } from '@storybook/addon-docs/blocks'
import * as Stories from './button.stories'

<Meta of={Stories} />

# Button

Interactive button with multiple
variants and sizes.

<Primary />

## Import

\`\`\`tsx
import { Button } from '@vllnt/ui'

<Button>Click me</Button>
\`\`\`

<Canvas
  of={Stories.Default}
  sourceState="shown"
/>

## API Reference

<Controls />

| Prop | Type |
| ---- | ---- |
| \`asChild\` | \`boolean\` |
`;

test("mdxToMarkdown drops imports and Storybook blocks, keeps text, code and tables", () => {
  const markdown = mdxToMarkdown(STORYBOOK_PAGE);
  assert.doesNotMatch(markdown, /addon-docs|button\.stories|<Meta|<Primary|<Canvas|<Controls|sourceState/);
  assert.match(markdown, /^# Button\n\nInteractive button with multiple\nvariants and sizes\.\n/);
  assert.match(markdown, /```tsx\nimport \{ Button \} from '@vllnt\/ui'\n\n<Button>Click me<\/Button>\n```/);
  assert.match(markdown, /\| `asChild` \| `boolean` \|\n$/);
  assert.doesNotMatch(markdown, /\n{3,}/);
});

test("describe returns the title and the first paragraph", () => {
  assert.deepEqual(describe(mdxToMarkdown(STORYBOOK_PAGE)), {
    summary: "Interactive button with multiple variants and sizes.",
    title: "Button",
  });
  assert.deepEqual(describe("# Label\n\n## Installation\n"), { summary: undefined, title: "Label" });
});

test("renderLlms links every doc relative to the package, levels in order", () => {
  const llms = renderLlms(PACKAGES.ui, [
    { group: "organisms", path: "docs/components/chart.md", title: "Chart" },
    { group: "atoms", path: "docs/components/button.md", summary: "A button.", title: "Button" },
  ]);
  assert.match(llms, /^# @vllnt\/ui\n\n> /);
  assert.match(llms, /- \[README\.md\]\(\.\/README\.md\): /);
  assert.match(llms, /- \[Button\]\(\.\/docs\/components\/button\.md\): A button\./);
  assert.ok(llms.indexOf("## Components: Atoms") < llms.indexOf("## Components: Organisms"));
  assert.match(llms, /## Ecosystem\n\n- \[vllnt oss\]\(https:\/\/oss\.vllnt\.com\/llms\.txt\)/);
  assert.doesNotMatch(llms, /github\.com|ui\.vllnt\.com/);
});

test("every package lists its generated paths in files, gitignore and docs", () => {
  const root = join(import.meta.dirname, "..");
  const gitignore = readFileSync(join(root, ".gitignore"), "utf8");
  for (const [name, config] of Object.entries(PACKAGES)) {
    const manifest = JSON.parse(readFileSync(join(root, config.directory, "package.json"), "utf8"));
    assert.equal(manifest.scripts.prepack, `node ../../scripts/agent-docs.mjs write ${name}`, name);
    assert.equal(manifest.scripts.postpack, `node ../../scripts/agent-docs.mjs clean ${name}`, name);
    for (const path of config.generated) {
      assert.ok(manifest.files.includes(path), `${name} files must include ${path}`);
      assert.ok(gitignore.includes(`${config.directory}/${path}`), `.gitignore must list ${config.directory}/${path}`);
    }
    for (const [path] of config.docs) {
      const shipped = manifest.files.some((entry) => path === entry || path.startsWith(`${entry}/`));
      assert.ok(shipped, `${name} links ${path} but does not ship it`);
    }
  }
});

test("barrelExports groups value exports by component folder", () => {
  assert.deepEqual(Object.fromEntries(barrelExports(BARREL)), {
    "atoms/animated-beam": ["AnimatedBeam"],
    "atoms/button": ["Button", "buttonVariants"],
    "molecules/types-only": [],
    "organisms/chart": ["BarChart", "Line"],
  });
});

test("fallbackPage gives the summary, the import and the install command", () => {
  const page = fallbackPage("atoms/animated-beam", ["AnimatedBeam"], {
    description: "A beam.",
    title: "Animated Beam",
  });
  assert.match(page, /^# Animated Beam\n\nA beam\.\n/);
  assert.match(page, /import \{ AnimatedBeam \} from '@vllnt\/ui'/);
  assert.match(page, /shadcn@latest add https:\/\/ui\.vllnt\.com\/r\/animated-beam\.json/);
  assert.match(fallbackPage("atoms/x", ["X"]), /^# x\n\n## Import/);
});

test("write fills a package with docs and llms.txt, clean removes them", () => {
  const directory = mkdtempSync(join(tmpdir(), "agent-docs-"));
  try {
    const components = join(directory, "src/components/atoms/button");
    mkdirSync(components, { recursive: true });
    writeFileSync(join(components, "button.mdx"), STORYBOOK_PAGE);
    writeFileSync(join(directory, "src/components/index.ts"), BARREL);
    const config = { ...PACKAGES.ui, copies: [], metadata: undefined };

    // button from its Storybook page; animated-beam and chart get fallback pages; types-only gets none.
    assert.equal(write(config, directory), 3);
    assert.match(readFileSync(join(directory, "docs/components/button.md"), "utf8"), /^# Button\n\nInteractive/);
    assert.match(readFileSync(join(directory, "docs/components/chart.md"), "utf8"), /import \{ BarChart, Line \}/);
    assert.equal(existsSync(join(directory, "docs/components/types-only.md")), false);
    const llms = readFileSync(join(directory, "llms.txt"), "utf8");
    assert.match(llms, /\[Button\]\(\.\/docs\/components\/button\.md\)/);
    assert.match(llms, /\[animated-beam\]\(\.\/docs\/components\/animated-beam\.md\)/);

    clean(config, directory);
    assert.equal(existsSync(join(directory, "docs")), false);
    assert.equal(existsSync(join(directory, "llms.txt")), false);
    assert.equal(existsSync(join(directory, "src/components/atoms/button/button.mdx")), true);
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
