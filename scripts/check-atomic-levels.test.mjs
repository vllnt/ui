import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";

import { checkAtomicLevels, findImportSpecifiers } from "./check-atomic-levels.mjs";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const script = join(scriptsDir, "check-atomic-levels.mjs");
const roots = [];

const CLEAN = {
  "index.ts": 'export * from "./atoms/button/button";\n',
  "atoms/button/button.tsx": 'import { cn } from "../../../lib/utils";\nexport const Button = () => cn("b");\n',
  "atoms/input/input.tsx": "export const Input = () => null;\n",
  "molecules/search-bar/search-bar.tsx":
    'import { Button } from "../../atoms/button/button";\nimport { Input } from "../../atoms/input/input";\nexport const SearchBar = () => [Button, Input];\n',
  "organisms/data-table/data-table.tsx":
    'import { SearchBar } from "../../molecules/search-bar/search-bar";\nimport { Tree } from "../tree-view/tree-view";\nexport const DataTable = () => [SearchBar, Tree];\n',
  "organisms/tree-view/tree-view.tsx": "export const Tree = () => null;\n",
  "templates/shell/shell.tsx":
    'import { DataTable } from "../../organisms/data-table/data-table";\nexport const Shell = () => DataTable;\n',
};

function fixture(overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), "atomic-levels-"));
  roots.push(root);
  const files = { ...CLEAN, ...overrides };
  for (const [path, content] of Object.entries(files)) {
    if (content === undefined) continue;
    mkdirSync(dirname(join(root, "components", path)), { recursive: true });
    writeFileSync(join(root, "components", path), content);
  }
  return root;
}

const check = (root, options = {}) =>
  checkAtomicLevels({ componentsDir: "components", cwd: root, ...options });

afterEach(() => {
  while (roots.length > 0) rmSync(roots.pop(), { force: true, recursive: true });
});

test("a clean layout passes and reports level counts", () => {
  const result = check(fixture());
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.counts, { atoms: 2, molecules: 1, organisms: 2, templates: 1 });
  assert.equal(result.imports, 5);
});

test("a component folder outside the level folders fails", () => {
  const { errors } = check(fixture({ "badge/badge.tsx": "export const Badge = 1;\n" }));
  assert.match(errors.join("\n"), /components\/badge is outside the level folders/);
});

test("a file placed directly in a level folder fails", () => {
  const { errors } = check(fixture({ "atoms/loose.tsx": "export const Loose = 1;\n" }));
  assert.match(errors.join("\n"), /atoms\/loose\.tsx must live inside a component folder/);
});

test("duplicate component names across levels fail", () => {
  const { errors } = check(fixture({ "molecules/input/input.tsx": "export const Input = 2;\n" }));
  assert.match(errors.join("\n"), /molecules\/input duplicates the component name of atoms\/input/);
});

test("an atom importing another component fails", () => {
  const { errors } = check(
    fixture({ "atoms/input/input.tsx": 'import { Button } from "../button/button";\n' }),
  );
  assert.match(errors.join("\n"), /input\.tsx:1 atoms\/input imports atoms\/button: atoms may import no other component/);
});

test("a molecule importing a molecule or an organism fails", () => {
  const { errors } = check(
    fixture({
      "molecules/field/field.tsx":
        'import { SearchBar } from "../search-bar/search-bar";\nimport { Tree } from "../../organisms/tree-view/tree-view";\n',
    }),
  );
  assert.equal(errors.length, 2);
  assert.match(errors[0], /molecules\/field imports molecules\/search-bar: molecules may import atoms$/);
  assert.match(errors[1], /molecules\/field imports organisms\/tree-view: molecules may import atoms$/);
});

test("a template importing a template fails", () => {
  const { errors } = check(
    fixture({ "templates/page/page.tsx": 'import { Shell } from "../shell/shell";\n' }),
  );
  assert.match(errors.join("\n"), /templates\/page imports templates\/shell: templates may import atoms, molecules, organisms/);
});

test("an import cycle between organisms fails", () => {
  const { errors } = check(
    fixture({
      "organisms/tree-view/tree-view.tsx": 'import { DataTable } from "../data-table/data-table";\n',
    }),
  );
  assert.deepEqual(errors, ["import cycle between organisms/data-table, organisms/tree-view"]);
});

test("re-exports, dynamic imports and require() are checked", () => {
  const { errors } = check(
    fixture({
      "atoms/icon/icon.tsx": [
        'export { Button } from "../button/button";',
        'export * from "../../molecules/search-bar/search-bar";',
        'const lazy = () => import("../../organisms/tree-view/tree-view");',
        'const legacy = require("../../templates/shell/shell");',
        "",
      ].join("\n"),
    }),
  );
  assert.equal(errors.length, 4);
  assert.deepEqual(
    errors.map((error) => error.match(/imports (\S+):/)[1]),
    ["atoms/button", "molecules/search-bar", "organisms/tree-view", "templates/shell"],
  );
});

test("importing the components barrel or a non-component path fails", () => {
  const { errors } = check(
    fixture({ "atoms/input/input.tsx": 'import { Button } from "../../index";\nimport "../..";\n' }),
  );
  assert.equal(errors.length, 2);
  assert.match(errors[0], /imports "\.\.\/\.\.\/index", which is not inside a component folder/);
});

test("comments, strings and exempt files are ignored", () => {
  const { errors } = check(
    fixture({
      "atoms/input/input.tsx": [
        '// import { Button } from "../button/button";',
        '/* export * from "../button/button"; */',
        "const example = 'import { Tree } from \"../../organisms/tree-view/tree-view\"';",
        'const template = `from "../button/button"`;',
        "export const Input = () => example + template;",
        "",
      ].join("\n"),
      "atoms/input/input.stories.tsx": 'import { Shell } from "../../templates/shell/shell";\n',
      "atoms/input/input.test.tsx": 'import { Shell } from "../../templates/shell/shell";\n',
      "atoms/input/input.visual.tsx": 'import { Shell } from "../../templates/shell/shell";\n',
      "atoms/input/__tests__/helper.ts": 'import { Shell } from "../../../templates/shell/shell";\n',
    }),
  );
  assert.deepEqual(errors, []);
});

test("--base directories sit below atoms and may not import components", () => {
  const root = fixture({
    "atoms/input/input.tsx": 'import { Box } from "../../../primitives/box";\nexport const Input = Box;\n',
  });
  mkdirSync(join(root, "primitives"));
  writeFileSync(join(root, "primitives", "box.ts"), "export const Box = 1;\n");
  assert.deepEqual(check(root, { baseDirs: ["primitives"] }).errors, []);

  writeFileSync(
    join(root, "primitives", "box.ts"),
    'import { Button } from "../components/atoms/button/button";\nexport const Box = Button;\n',
  );
  const { errors } = check(root, { baseDirs: ["primitives"] });
  assert.match(errors.join("\n"), /primitives\/box\.ts:1 imports "\.\.\/components\/atoms\/button\/button": modules below atoms may not import components/);
});

test("the CLI exits 0 when clean, 1 on violations and 2 on bad usage", () => {
  const clean = fixture();
  const ok = spawnSync(process.execPath, [script, "components"], { cwd: clean, encoding: "utf8" });
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /Atomic levels OK: 2 atoms, 1 molecules, 2 organisms, 1 templates; 5 component imports checked\./);

  const broken = fixture({ "atoms/input/input.tsx": 'import "../button/button";\n' });
  const failed = spawnSync(process.execPath, [script, "components"], { cwd: broken, encoding: "utf8" });
  assert.equal(failed.status, 1);
  assert.match(failed.stderr, /Atomic level check failed \(1\)/);

  const usage = spawnSync(process.execPath, [script], { cwd: clean, encoding: "utf8" });
  assert.equal(usage.status, 2);
});

test("@vllnt/ui-native check:atomic passes on a copy of the package and fails on an upward import", () => {
  const root = mkdtempSync(join(tmpdir(), "atomic-levels-native-"));
  roots.push(root);
  const packageDir = join(scriptsDir, "../packages/ui-native");
  const nativeDir = join(root, "packages/ui-native");
  mkdirSync(join(root, "scripts"));
  cpSync(script, join(root, "scripts/check-atomic-levels.mjs"));
  cpSync(join(packageDir, "src"), join(nativeDir, "src"), { recursive: true });
  const { scripts } = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
  const [command, ...args] = scripts["check:atomic"].split(" ");
  assert.equal(command, "node");
  const run = () => spawnSync(process.execPath, args, { cwd: nativeDir, encoding: "utf8" });

  const clean = run();
  assert.equal(clean.status, 0, clean.stderr);

  const button = join(nativeDir, "src/components/atoms/button/button.tsx");
  writeFileSync(button, `import { Field } from "../../molecules/field/field";\n${readFileSync(button, "utf8")}`);
  const primitive = join(nativeDir, "src/primitives/control-group.tsx");
  writeFileSync(
    primitive,
    `${readFileSync(primitive, "utf8")}export { Button } from "../components/atoms/button/button";\n`,
  );
  const broken = run();
  assert.equal(broken.status, 1);
  assert.match(broken.stderr, /Atomic level check failed \(2\)/);
  assert.match(broken.stderr, /button\.tsx:1 atoms\/button imports molecules\/field: atoms may import no other component/);
  assert.match(broken.stderr, /control-group\.tsx:\d+ imports "\.\.\/components\/atoms\/button\/button": modules below atoms may not import components/);
});

test("findImportSpecifiers reports every import form with its line", () => {
  const source = [
    'import a from "./a";',
    "import {",
    "  b,",
    '} from "./b";',
    'import "./c";',
    'export * as d from "./d";',
    'const e = await import("./e");',
    "const f = /from \"x\"/.test(value) ? 1 : 2 / 3;",
    'object.import("./not-an-import");',
    "const view = <p>Don't mind this</p>;",
    'const g = import("./g");',
    "",
  ].join("\n");
  assert.deepEqual(findImportSpecifiers(source), [
    { line: 1, specifier: "./a" },
    { line: 4, specifier: "./b" },
    { line: 5, specifier: "./c" },
    { line: 6, specifier: "./d" },
    { line: 7, specifier: "./e" },
    { line: 11, specifier: "./g" },
  ]);
});
