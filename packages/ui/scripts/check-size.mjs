/**
 * Bundle-size budget check for the built `@vllnt/ui` package.
 *
 * Each check bundles one export from `dist/index.js` the way a consumer's
 * bundler would: esbuild, minified browser ESM, `process.env.NODE_ENV` set to
 * "production", with react, react-dom, next and next-themes kept external.
 * It fails when the minified JavaScript (CSS is not counted) exceeds the
 * budget in `size-budget.json`.
 *
 * A check measures the code a page loads up front: modules reached only
 * through a dynamic `import()` stay external. Checks marked `"withLazy": true`
 * also count those lazily loaded chunks.
 *
 * Usage: pnpm -F @vllnt/ui size   (run `pnpm -F @vllnt/ui build` first)
 * To change a budget, edit `size-budget.json` and explain why in the PR.
 */

import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";

import * as esbuild from "esbuild";

const packageDirectory = resolve(import.meta.dirname, "..");
const distributionEntry = join(packageDirectory, "dist/index.js");
const budget = JSON.parse(
  readFileSync(join(import.meta.dirname, "size-budget.json"), "utf8"),
);

const keepDynamicImportsExternal = {
  name: "keep-dynamic-imports-external",
  setup(build) {
    build.onResolve({ filter: /.*/ }, (arguments_) =>
      arguments_.kind === "dynamic-import"
        ? { external: true, path: arguments_.path }
        : undefined,
    );
  },
};

function entrySource(exportName) {
  const specifier = JSON.stringify(distributionEntry);
  return exportName === "*"
    ? `export * from ${specifier};`
    : `export { ${exportName} } from ${specifier};`;
}

function formatBytes(bytes) {
  return `${bytes.toLocaleString("en-US")} B`;
}

if (!existsSync(distributionEntry)) {
  console.error(
    `Missing ${distributionEntry}. Run \`pnpm -F @vllnt/ui build\` first.`,
  );
  process.exit(1);
}

const workDirectory = mkdtempSync(join(tmpdir(), "vllnt-ui-size-"));
const entryFile = join(workDirectory, "entry.js");
writeFileSync(entryFile, "");

const options = {
  bundle: true,
  define: { "process.env.NODE_ENV": '"production"' },
  entryPoints: [entryFile],
  external: [
    "next",
    "next/*",
    "next-themes",
    "react",
    "react/*",
    "react-dom",
    "react-dom/*",
  ],
  format: "esm",
  loader: { ".css": "empty" },
  logLevel: "silent",
  minify: true,
  outdir: join(workDirectory, "out"),
  platform: "browser",
  write: false,
};

const contexts = {
  eager: await esbuild.context({
    ...options,
    plugins: [keepDynamicImportsExternal],
  }),
  withLazy: await esbuild.context(options),
};

/**
 * Measures every component and lib module of `dist` in one esbuild build with
 * code splitting: a module's up-front size is its entry chunk plus every chunk
 * it imports statically, so it counts all of the module's exports (an upper
 * bound for any one of them). Each must stay under `perModule.maxBytes` unless
 * `perModule.skip` names it with a reason. This catches an eager heavy
 * dependency, a module-level side effect or an internal barrel import in any
 * component, not only in the named checks.
 */
async function measureEveryModule() {
  const distributionDirectory = join(packageDirectory, "dist");
  const modules = readdirSync(distributionDirectory, { recursive: true })
    .filter(
      (file) =>
        /^(components|lib)\//.test(file) &&
        file.endsWith(".js") &&
        !file.endsWith("/index.js"),
    )
    .filter((file) => !(file in budget.perModule.skip));

  const { metafile } = await esbuild.build({
    ...options,
    entryPoints: modules.map((file) => join(distributionDirectory, file)),
    metafile: true,
    plugins: [keepDynamicImportsExternal],
    splitting: true,
  });
  const outputByModule = new Map(
    Object.entries(metafile.outputs)
      .filter(([, output]) => output.entryPoint)
      .map(([path, output]) => [
        relative(distributionDirectory, resolve(output.entryPoint)),
        path,
      ]),
  );
  const upFrontBytes = (path, seen) => {
    if (seen.has(path)) return 0;
    seen.add(path);
    const output = metafile.outputs[path];
    return output.imports
      .filter(
        (imported) =>
          imported.kind === "import-statement" && !imported.external,
      )
      .reduce(
        (sum, imported) => sum + upFrontBytes(imported.path, seen),
        output.bytes,
      );
  };

  return modules
    .map((file) => ({
      bytes: upFrontBytes(outputByModule.get(file), new Set()),
      file,
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

const rows = [];
let everyModule = [];
try {
  everyModule = await measureEveryModule();
  for (const check of budget.checks) {
    writeFileSync(entryFile, entrySource(check.export));
    // react-doctor-disable-next-line react-doctor/async-await-in-loop -- every check rewrites the one shared entry file and rebuilds the shared esbuild context, so the checks must run one at a time
    const result =
      await contexts[check.withLazy ? "withLazy" : "eager"].rebuild();
    const scripts = result.outputFiles.filter((file) =>
      file.path.endsWith(".js"),
    );
    const bytes = scripts.reduce((sum, file) => sum + file.contents.length, 0);
    const gzipBytes = scripts.reduce(
      (sum, file) => sum + gzipSync(file.contents, { level: 9 }).length,
      0,
    );
    rows.push({ bytes, check, gzipBytes, ok: bytes <= check.maxBytes });
  }
} finally {
  await Promise.all(
    Object.values(contexts).map((context) => context.dispose()),
  );
  rmSync(workDirectory, { force: true, recursive: true });
}

const table = [
  ["check", "minified", "gzip", "budget", "status"],
  ...rows.map(({ bytes, check, gzipBytes, ok }) => [
    check.name,
    formatBytes(bytes),
    formatBytes(gzipBytes),
    formatBytes(check.maxBytes),
    ok ? "ok" : "OVER BUDGET",
  ]),
];
const widths = table[0].map((_, column) =>
  Math.max(...table.map((cells) => cells[column].length)),
);
for (const cells of table) {
  console.log(
    cells
      .map((cell, column) =>
        column === 0
          ? cell.padEnd(widths[column])
          : cell.padStart(widths[column]),
      )
      .join("  "),
  );
}

const { maxBytes: moduleMaxBytes } = budget.perModule;
const oversized = everyModule.filter(({ bytes }) => bytes > moduleMaxBytes);
console.log(
  `\nEvery module, up front (cap ${formatBytes(moduleMaxBytes)}): ${everyModule.length} measured, largest:`,
);
for (const { bytes, file } of everyModule.slice(0, 5)) {
  console.log(`  ${file}  ${formatBytes(bytes)}`);
}

const failures = rows.filter((row) => !row.ok);
if (failures.length > 0 || oversized.length > 0) {
  for (const { bytes, check } of failures) {
    console.error(
      `${check.name}: ${bytes} B exceeds the ${check.maxBytes} B budget.`,
    );
  }
  for (const { bytes, file } of oversized.slice(0, 10)) {
    console.error(
      `dist/${file}: loads ${bytes} B up front, over the ${moduleMaxBytes} B cap for one module.`,
    );
  }
  if (oversized.length > 10) {
    console.error(`...and ${oversized.length - 10} more modules over the cap.`);
  }
  console.error(
    "Find what grew (e.g. esbuild --metafile) and fix it: load a heavy dependency with import() as CodeBlock does, and never import the package barrel from inside src. If the size is intended, add the module to perModule.skip with a reason and give its export a named check in scripts/size-budget.json.",
  );
  process.exit(1);
}

console.log(
  `All ${rows.length} bundle-size checks and ${everyModule.length} modules are within budget.`,
);
