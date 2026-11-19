// Run with: node --test apps/native-catalog/scripts/verify-published.test.mjs
// No install needed for the parser tests; the import-rewrite tests need `typescript` and are
// skipped (not passed) when the workspace is not installed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  classifySpec,
  cleanEnvironment,
  jestRows,
  lockHasPackage,
  pickPins,
  readAgePolicy,
  readImporterVersions,
  renderTable,
  rewriteSource,
  scratchWorkspaceYaml,
  summarize,
  tscDetail,
} from "./verify-published.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

test("classifySpec accepts exact versions and dist-tags, refuses ranges", () => {
  assert.equal(classifySpec("0.1.0-canary.20260917105553.sha7466647a4ba5"), "version");
  assert.equal(classifySpec("0.1.0"), "version");
  assert.equal(classifySpec("canary"), "tag");
  assert.equal(classifySpec("native-0.1.0-canary.1.sha7466647a4ba5"), "tag");
  for (const range of ["^0.1.0", "~0.1", "0.1.x", ">=0.1.0", "", "a b", "1.2"]) {
    assert.throws(() => classifySpec(range), /neither an exact version nor a dist-tag/, range);
  }
});

test("readImporterVersions reads resolved versions and drops peer suffixes and links", () => {
  const lock = [
    "importers:",
    "",
    "  apps/other:",
    "    dependencies:",
    "      expo:",
    "        specifier: ~1.0.0",
    "        version: 1.0.0",
    "",
    "  apps/native-catalog:",
    "    dependencies:",
    "      '@vllnt/ui-native':",
    "        specifier: workspace:*",
    "        version: link:../../packages/ui-native",
    "      expo:",
    "        specifier: ~57.0.31",
    "        version: 57.0.31(@babel/core@7.29.7(supports-color@8.1.1))(react@19.2.3)",
    "    devDependencies:",
    "      '@types/jest':",
    "        specifier: ^29.5.14",
    "        version: 29.5.14",
    "",
    "  apps/registry:",
    "    dependencies:",
    "      react:",
    "        specifier: 19.3.1",
    "        version: 19.3.1",
    "",
    "packages:",
  ].join("\n");
  assert.deepEqual(readImporterVersions(lock, "apps/native-catalog"), {
    "@types/jest": "29.5.14",
    expo: "57.0.31",
  });
  assert.throws(() => readImporterVersions(lock, "apps/missing"), /not found/);
});

test("the real lockfile resolves every pinned package to an exact version", () => {
  const versions = readImporterVersions(readFileSync(join(root, "pnpm-lock.yaml"), "utf8"), "apps/native-catalog");
  const pins = pickPins(versions, ["expo", "react", "react-native", "react-dom", "react-native-web", "jest", "@testing-library/react-native", "typescript"]);
  assert.match(pins.expo, /^57\./);
  assert.equal(pins.react, pins["react-dom"]);
  assert.throws(() => pickPins({ expo: "57.0.31" }, ["expo", "jest"]), /no exact version for: jest/);
});

test("lockHasPackage matches only the exact resolved package", () => {
  const lock = readFileSync(join(root, "pnpm-lock.yaml"), "utf8");
  const versions = readImporterVersions(lock, "apps/native-catalog");
  assert.ok(lockHasPackage(lock, "@react-native/jest-preset", versions["react-native"]));
  assert.ok(!lockHasPackage(lock, "@react-native/jest-preset", "0.0.1"));
  assert.ok(!lockHasPackage("  '@a/b@1.0.0-beta':\n", "@a/b", "1.0.0"));
  assert.ok(lockHasPackage("  left-pad@1.3.0:\n", "left-pad", "1.3.0"));
});

test("readAgePolicy reads the age and the exclude list, and refuses a missing age", () => {
  const policy = readAgePolicy(readFileSync(join(root, "pnpm-workspace.yaml"), "utf8"));
  assert.equal(policy.minimumReleaseAge, 10_080);
  assert.ok(policy.exclude.includes("@vllnt/*"));

  const synthetic = readAgePolicy(
    'packages:\n  - "apps/*"\nminimumReleaseAge: 1440 # a day\nminimumReleaseAgeExclude:\n  - "left-pad" # reason\n  # a comment\n  - \'@scope/*\'\nstrictDepBuilds: true\n',
  );
  assert.deepEqual(synthetic, { exclude: ["left-pad", "@scope/*"], minimumReleaseAge: 1440 });

  assert.throws(() => readAgePolicy("packages:\n  - apps/*\n"), /refusing to install without the package-age gate/);
});

test("scratchWorkspaceYaml copies the policy and always exempts @vllnt/* exactly once", () => {
  const withScope = scratchWorkspaceYaml({ exclude: ["@vllnt/*", "left-pad"], minimumReleaseAge: 10_080 });
  assert.match(withScope, /^minimumReleaseAge: 10080$/m);
  assert.equal(withScope.match(/"@vllnt\/\*"/g).length, 1);
  assert.match(withScope, /"left-pad"/);
  assert.match(scratchWorkspaceYaml({ exclude: [], minimumReleaseAge: 1 }), /"@vllnt\/\*"/);
  assert.doesNotMatch(withScope, /^packages:/m);
});

test("cleanEnvironment removes the workspace NODE_PATH, node_modules PATH entries and pnpm run variables", () => {
  const cleaned = cleanEnvironment(
    {
      HOME: "/home/x",
      INIT_CWD: "/repo",
      NODE_PATH: "/repo/node_modules/.pnpm/node_modules",
      PATH: "/repo/apps/a/node_modules/.bin:/usr/bin:/repo/node_modules/.bin:/bin",
      npm_config_user_agent: "pnpm/11",
      npm_package_name: "catalog",
    },
    { CI: "1" },
  );
  assert.deepEqual(cleaned, { CI: "1", HOME: "/home/x", PATH: "/usr/bin:/bin" });
});

test("summarize counts results and renderTable aligns columns", () => {
  const rows = [
    { consumer: "registry", detail: "ok", ms: 1500, status: "PASS", step: "resolve" },
    { consumer: "catalog", detail: "needs ModalLayer", status: "SKIP", step: "a11y x" },
    { consumer: "catalog", detail: "exit 1", ms: 200, status: "FAIL", step: "typecheck" },
  ];
  assert.deepEqual(summarize(rows), { fail: 1, pass: 1, skip: 1 });
  const lines = renderTable(rows).split("\n");
  assert.equal(lines.length, 5);
  assert.match(lines[2], /^registry\s+resolve\s+PASS\s+1\.5s\s+ok$/);
});

test("jestRows reports per file, counts passes, names the first failure, and flags files that never ran", () => {
  const directory = "/scratch/catalog";
  const results = {
    testResults: [
      { assertionResults: [{ status: "passed" }, { status: "passed" }], name: `${directory}/App.test.tsx`, status: "passed" },
      {
        assertionResults: [{ status: "passed" }, { status: "failed", title: "accordion meets the contract" }],
        name: `${directory}/ui-native-tests/accessibility-contract.test.tsx`,
        status: "failed",
      },
      { assertionResults: [], message: "\u001B[31m  ● Test suite failed to run\u001B[0m\n   Cannot find module", name: `${directory}/all-components.test.tsx`, status: "failed" },
    ],
  };
  const expected = ["App.test.tsx", "all-components.test.tsx", "ui-native-tests/accessibility-contract.test.tsx", "ui-native-tests/accessibility-regressions.test.tsx"];
  assert.deepEqual(jestRows(results, directory, expected), [
    { detail: "2 tests", status: "PASS", step: "jest App.test.tsx" },
    { detail: "1 failed of 2: accordion meets the contract", status: "FAIL", step: "a11y accessibility-contract" },
    { detail: "suite failed to run: Cannot find module", status: "FAIL", step: "jest all-components.test.tsx" },
    { detail: "test file was not executed", status: "FAIL", step: "jest ui-native-tests/accessibility-regressions.test.tsx" },
  ]);
});

test("tscDetail counts type errors and names the first, and is silent for other failures", () => {
  const log = "$ tsc --noEmit\na.tsx(1,2): error TS2322: Type x is not y.\n  Property z is missing.\nb.tsx(3,4): error TS2345: Bad arg.\n";
  assert.equal(tscDetail(log), "2 type errors, first: a.tsx(1,2): error TS2322: Type x is not y.");
  assert.match(tscDetail("c.ts(1,1): error TS1005: x"), /^1 type error, first:/);
  assert.equal(tscDetail("command not found: tsc"), undefined);
});

let ts;
try {
  ts = createRequire(import.meta.url)("typescript");
} catch {
  ts = undefined;
}
const rewriteTest = ts ? test : test.skip;

const barrel = new Set(["Button", "ThemeProvider", "ReducedMotionService"]);
const references = {
  "../components/atoms/button/button": { kind: "internal" },
  "../index": { kind: "barrel" },
  "../primitives/modal-layer": { kind: "internal" },
  "../primitives/use-reduced-motion": { kind: "internal" },
  "../../registry.json": { kind: "registry" },
  "./fixture-data": { file: "/src/tests/fixture-data.tsx", kind: "copy", specifier: "./fixture-data" },
  "./gone": { kind: "broken", reason: "does not resolve" },
};
const rewrite = (text) =>
  rewriteSource(ts, { barrel, fileName: "/src/tests/x.test.tsx", resolveReference: (specifier) => references[specifier], text });

rewriteTest("rewriteSource sends the barrel, registry and exported internals to the package", () => {
  const result = rewrite(
    [
      'import manifest from "../../registry.json";',
      'import { Button } from "../components/atoms/button/button";',
      'import { Button as B2 } from "../index";',
      'import type { ReducedMotionService } from "../primitives/use-reduced-motion";',
      'import { rows } from "./fixture-data";',
      'import { react } from "react";',
    ].join("\n"),
  );
  assert.equal(result.problems.length, 0);
  assert.equal(result.rewritten, 4);
  assert.match(result.text, /import manifest from "@vllnt\/ui-native\/registry.json";/);
  assert.equal(result.text.match(/from "@vllnt\/ui-native";/g).length, 3);
  assert.match(result.text, /from "\.\/fixture-data";/);
  assert.match(result.text, /from "react";/);
  assert.deepEqual([...result.dependencies], ["/src/tests/fixture-data.tsx"]);
});

rewriteTest("rewriteSource reports internals the package does not export instead of faking them", () => {
  const value = rewrite('import { ModalLayer } from "../primitives/modal-layer";');
  assert.deepEqual(value.problems.map((problem) => problem.severity), ["internal"]);
  assert.match(value.problems[0].message, /needs ModalLayer .* not exported by the package/);

  const mocked = rewrite('jest.mock("../primitives/modal-layer");\nconst x = require("../components/atoms/button/button");');
  assert.equal(mocked.problems.length, 2);
  assert.match(mocked.problems[0].message, /mocks or requires package internal/);

  const namespace = rewrite('import * as all from "../components/atoms/button/button";\nimport Default from "../primitives/modal-layer";');
  assert.equal(namespace.problems.length, 2);

  const broken = rewrite('import { x } from "./gone";');
  assert.equal(broken.problems[0].severity, "broken");
});

rewriteTest("rewriteSource shims only unexported types, and says so", () => {
  const result = rewrite(
    'import type { Button, SearchDialogLabels } from "../components/atoms/button/button";\nconst labels: SearchDialogLabels = {};',
  );
  assert.equal(result.problems.length, 0);
  assert.deepEqual(result.shims, ["SearchDialogLabels"]);
  assert.match(result.text, /import type \{ Button \} from "@vllnt\/ui-native";/);
  assert.match(result.text, /type SearchDialogLabels = any; \/\/ shim/);
  assert.match(result.text, /const labels: SearchDialogLabels = \{\};/);

  const mixed = rewrite('import { Button, type Gone } from "../components/atoms/button/button";');
  assert.equal(mixed.problems.length, 0);
  assert.deepEqual(mixed.shims, ["Gone"]);
  assert.match(mixed.text, /import \{ Button \} from "@vllnt\/ui-native";/);
});
