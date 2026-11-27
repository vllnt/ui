import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import {
  PACKAGES,
  planComponentDocs,
  readMetadata,
} from "../../../scripts/agent-docs.mjs";
import { collectSubpaths } from "./subpaths.ts";

const packageDirectory = resolve(import.meta.dirname, "..");
const temporaryDirectory = await mkdtemp(join(tmpdir(), "vllnt-ui-pack-"));
const relativeSpecifierPattern =
  /(\b(?:from|import)\s*(?:\(\s*)?)(["'])(\.\.?\/[^"'?#]+)\2/g;

function run(command, arguments_, cwd = packageDirectory) {
  const result = spawnSync(command, arguments_, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${arguments_.join(" ")} failed.\n${result.stdout ?? ""}`,
    );
  }
  return result.stdout.trim();
}

function assertFile(path, field) {
  try {
    const metadata = statSync(path);
    if (!metadata.isFile()) throw new Error();
  } catch {
    throw new Error(`Packed ${field} target is missing: ${path}`);
  }
}

/** The subpaths the barrel defines, with the names each one must export. */
const expectedSubpaths = collectSubpaths(
  readFileSync(join(packageDirectory, "src/components/index.ts"), "utf8"),
  readFileSync(join(packageDirectory, "src/index.ts"), "utf8"),
).map(({ modules, name, types }) => ({
  name,
  types,
  values: modules.flatMap(({ names }) => names.map(({ exported }) => exported)),
}));

/**
 * Names of the `@vllnt/ui/<name>` subpaths in a packed package, which must be
 * exactly the subpaths the barrel defines.
 */
function packedSubpaths(packedDirectory) {
  const names = readdirSync(join(packedDirectory, "dist/subpaths"))
    .filter((file) => file.endsWith(".js"))
    .map((file) => file.slice(0, -".js".length))
    .sort();
  const expected = expectedSubpaths.map(({ name }) => name).sort();
  const missing = expected.filter((name) => !names.includes(name));
  const extra = names.filter((name) => !expected.includes(name));
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `Packed dist/subpaths differs from the barrel. Missing: ${missing.join(", ") || "none"}. Extra: ${extra.join(", ") || "none"}.`,
    );
  }
  return names;
}

/**
 * The prepack (scripts/agent-docs.mjs) ships an llms.txt index, a page for
 * every exported component and an exact copy of the agent skill, for agents
 * that read node_modules/@vllnt/ui.
 */
function assertAgentDocs(packedDirectory) {
  const config = PACKAGES.ui;
  const pages = planComponentDocs(packageDirectory, config, readMetadata(config));
  const missing = pages.filter(
    ({ path }) => !existsSync(join(packedDirectory, path)),
  );
  if (pages.length === 0 || missing.length > 0) {
    throw new Error(
      `Packed docs/components is missing ${missing.length || "all"} of ${pages.length} component pages: ${missing
        .slice(0, 10)
        .map(({ path }) => path)
        .join(", ")}.`,
    );
  }
  assertFile(join(packedDirectory, "llms.txt"), "llms.txt agent docs index");
  for (const [from, to] of config.copies) {
    const packed = join(packedDirectory, to);
    assertFile(packed, to);
    if (
      readFileSync(packed, "utf8") !==
      readFileSync(join(packageDirectory, "../..", from), "utf8")
    ) {
      throw new Error(`Packed ${to} differs from ${from}.`);
    }
  }
}

function assertExportTargets(value, path, packedDirectory) {
  if (typeof value === "string") {
    if (!value.startsWith("./") || value.startsWith("./src/")) {
      throw new Error(`Packed ${path} has an invalid target: ${value}.`);
    }
    if (value.includes("*")) {
      // A subpath pattern: every subpath must have this target file.
      for (const name of packedSubpaths(packedDirectory)) {
        assertFile(join(packedDirectory, value.replaceAll("*", name)), path);
      }
      return;
    }
    assertFile(join(packedDirectory, value), path);
    return;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Packed ${path} must contain file targets.`);
  }

  for (const [key, target] of Object.entries(value)) {
    assertExportTargets(target, `${path}.${key}`, packedDirectory);
  }
}

function assertNoLocalProtocols(value, path = "package.json") {
  if (typeof value === "string") {
    if (value.startsWith("workspace:") || value.startsWith("./src/")) {
      throw new Error(`Packed ${path} contains a local-only target: ${value}.`);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertNoLocalProtocols(entry, `${path}[${index}]`),
    );
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      assertNoLocalProtocols(entry, `${path}.${key}`);
    }
  }
}

async function listJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? listJavaScriptFiles(path)
        : Promise.resolve(path.endsWith(".js") ? [path] : []);
    }),
  );

  return files.flat();
}

async function assertResolvableRelativeSpecifiers(packedDirectory) {
  const files = await listJavaScriptFiles(join(packedDirectory, "dist"));

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(relativeSpecifierPattern)) {
      const specifier = match[3];
      assertFile(
        resolve(dirname(file), specifier),
        `ESM specifier ${specifier} in ${file}`,
      );
    }
  }
}

async function linkInstalledPackage(name, nodeModulesDirectory) {
  const source = await realpath(join(packageDirectory, "node_modules", name));
  const target = join(nodeModulesDirectory, ...name.split("/"));
  await mkdir(dirname(target), { recursive: true });
  await symlink(source, target, "dir");
}

async function writePackageStub(name, manifest, files, nodeModulesDirectory) {
  const directory = join(nodeModulesDirectory, ...name.split("/"));
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, "package.json"),
    `${JSON.stringify({ name, type: "module", ...manifest }, null, 2)}\n`,
  );
  await Promise.all(
    Object.entries(files).map(([file, source]) =>
      writeFile(join(directory, file), source),
    ),
  );
}

async function assertNodeResolution(manifest, packedDirectory) {
  const nodeModulesDirectory = join(temporaryDirectory, "node_modules");
  const packageTarget = join(nodeModulesDirectory, "@vllnt", "ui");
  await mkdir(dirname(packageTarget), { recursive: true });
  await symlink(packedDirectory, packageTarget, "dir");

  // `next` and `next-themes` are replaced by stubs below; linking the real
  // packages first would make the stub writes land inside node_modules.
  const stubbedPeers = new Set(["next", "next-themes"]);
  const optionalPeers = new Set([
    ...stubbedPeers,
    ...Object.entries(manifest.peerDependenciesMeta ?? {})
      .filter(([, metadata]) => metadata?.optional === true)
      .map(([name]) => name),
  ]);
  const installedPackages = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}).filter(
      (name) => !optionalPeers.has(name),
    ),
  ]);
  await Promise.all(
    [...installedPackages].map((name) =>
      linkInstalledPackage(name, nodeModulesDirectory),
    ),
  );

  await writePackageStub(
    "next",
    {
      exports: {
        "./image": "./image.js",
        "./link": "./link.js",
        "./navigation": "./navigation.js",
      },
    },
    {
      "image.js": "export default function Image() { return null; }\n",
      "link.js": "export default function Link() { return null; }\n",
      "navigation.js": [
        "export function usePathname() { return \"/\"; }",
        "export function useRouter() { return {}; }",
        "export function useSearchParams() { return new URLSearchParams(); }",
        "",
      ].join("\n"),
    },
    nodeModulesDirectory,
  );
  await writePackageStub(
    "next-themes",
    { exports: "./index.js" },
    {
      "index.js": [
        "export function ThemeProvider({ children }) { return children; }",
        "export function useTheme() { return {}; }",
        "",
      ].join("\n"),
    },
    nodeModulesDirectory,
  );

  const consumer = join(temporaryDirectory, "import-package.mjs");
  await writeFile(
    consumer,
    [
      'const entry = import.meta.resolve("@vllnt/ui");',
      'if (!entry.endsWith("/dist/index.js")) throw new Error(`Invalid root entry: ${entry}`);',
      'const preset = await import("@vllnt/ui/tailwind-preset");',
      'if (!preset.default) throw new Error("Missing tailwind preset default export.");',
      'const { default: manifest } = await import("@vllnt/ui/package.json", { with: { type: "json" } });',
      'if (manifest.name !== "@vllnt/ui") throw new Error(`Invalid package.json export: ${manifest.name}`);',
      // Every subpath resolves to its own entry and exports exactly the
      // barrel's values for it, as the same module instances as the root.
      `const subpaths = ${JSON.stringify(
        expectedSubpaths.map(({ name, values }) => ({ name, values })),
      )};`,
      'const root = await import("@vllnt/ui");',
      "for (const { name, values } of subpaths) {",
      "  const resolved = import.meta.resolve(`@vllnt/ui/${name}`);",
      "  if (!resolved.endsWith(`/dist/subpaths/${name}.js`)) throw new Error(`Invalid subpath entry: ${resolved}`);",
      "  const subpath = await import(`@vllnt/ui/${name}`);",
      '  const keys = Object.keys(subpath).sort().join(", ");',
      '  const expected = [...values].sort().join(", ");',
      "  if (keys !== expected) throw new Error(`@vllnt/ui/${name} exports [${keys}], expected [${expected}].`);",
      "  for (const key of values) {",
      "    if (root[key] !== subpath[key]) throw new Error(`@vllnt/ui/${name} exports ${key}, which differs from the root export.`);",
      "  }",
      "}",
      "",
    ].join("\n"),
  );
  // Dependencies import their own CSS (for example @xyflow/react), which a
  // bundler handles and Node does not, so the check loads `.css` as empty.
  await writeFile(
    join(temporaryDirectory, "css-hooks.mjs"),
    [
      "export async function load(url, context, nextLoad) {",
      '  if (url.endsWith(".css")) return { format: "module", shortCircuit: true, source: "" };',
      "  return nextLoad(url, context);",
      "}",
      "",
    ].join("\n"),
  );
  await writeFile(
    join(temporaryDirectory, "register-css-hooks.mjs"),
    'import { register } from "node:module";\nregister("./css-hooks.mjs", import.meta.url);\n',
  );
  run(
    process.execPath,
    ["--import", "./register-css-hooks.mjs", consumer],
    temporaryDirectory,
  );
}

/**
 * Bundles a consumer of the plain exports from the packed subpaths and checks
 * that no `tailwind-merge` or `class-variance-authority` code reaches the
 * bundle. `Separator` and `ToggleGroup` consumers are the controls: they must
 * bring those packages, so the check can fail. Runs after
 * `assertNodeResolution`, which links the dependencies.
 */
async function assertTailwindMergeFree() {
  const { build } = await import("esbuild");
  const bundledInputs = async (contents) => {
    const result = await build({
      absWorkingDir: temporaryDirectory,
      bundle: true,
      external: ["react", "react-dom", "react/jsx-runtime"],
      format: "esm",
      logLevel: "silent",
      metafile: true,
      platform: "browser",
      stdin: { contents, resolveDir: temporaryDirectory },
      write: false,
    });
    return Object.values(result.metafile.outputs).flatMap((output) =>
      Object.entries(output.inputs)
        .filter(([, input]) => input.bytesInOutput > 0)
        .map(([path]) => path),
    );
  };
  const plain = await bundledInputs(
    [
      'export { PlainSeparator } from "@vllnt/ui/separator";',
      'export { UnstyledButton } from "@vllnt/ui/button";',
      'export { cx } from "@vllnt/ui/utils";',
      'export { UnstyledToggleGroup, UnstyledToggleGroupItem } from "@vllnt/ui/toggle-group";',
    ].join("\n"),
  );
  const forbidden = ["tailwind-merge", "class-variance-authority"];
  const leaked = plain.filter((path) =>
    forbidden.some((name) => path.includes(`/${name}/`)),
  );
  if (leaked.length > 0) {
    throw new Error(
      `The plain exports bundle tailwind-merge or class-variance-authority: ${leaked.join(", ")}`,
    );
  }
  const expected = ["plain-separator.js", "unstyled-toggle-group.js"];
  const missing = expected.filter(
    (file) => !plain.some((path) => path.endsWith(file)),
  );
  if (missing.length > 0) {
    throw new Error(
      `The plain bundle is missing ${missing.join(", ")}: ${plain.join(", ")}`,
    );
  }
  const controls = [
    ["Separator", "separator", ["tailwind-merge"]],
    ["ToggleGroup", "toggle-group", forbidden],
  ];
  const absent = await Promise.all(
    controls.map(async ([name, subpath, packages]) => {
      const control = await bundledInputs(
        `export { ${name} } from "@vllnt/ui/${subpath}";`,
      );
      return packages
        .filter((pkg) => !control.some((path) => path.includes(`/${pkg}/`)))
        .map((pkg) => `${name} lacks ${pkg}`);
    }),
  );
  if (absent.flat().length > 0) {
    throw new Error(`Control bundles: ${absent.flat().join("; ")}.`);
  }
}

/**
 * Type-checks an ES module consumer that imports, by name, every value and
 * type the barrel defines for every subpath, under the two module resolutions
 * consumers use.
 */
async function assertSubpathTypes(packedDirectory) {
  const nodeModulesDirectory = join(temporaryDirectory, "node_modules");
  await Promise.all(
    ["@types/react", "@types/react-dom"].map((name) =>
      linkInstalledPackage(name, nodeModulesDirectory),
    ),
  );
  packedSubpaths(packedDirectory);
  const values = [];
  const lines = expectedSubpaths.map(
    ({ name, types, values: names }, index) => {
      const imports = [
        ...names.map((value) => {
          values.push(`s${index}_${value}`);
          return `${value} as s${index}_${value}`;
        }),
        ...types.map((type) => `type ${type} as s${index}_${type}`),
      ];
      return `import { ${imports.join(", ")} } from "@vllnt/ui/${name}";`;
    },
  );
  lines.push(
    'import type { ButtonProps } from "@vllnt/ui/button";',
    'const props: ButtonProps = { variant: "outline" };',
    `export const checked = [props, ${values.join(", ")}];`,
    "",
  );
  await writeFile(join(temporaryDirectory, "consumer.ts"), lines.join("\n"));
  // Check the consumer as an ES module, the only form the exports support.
  await writeFile(
    join(temporaryDirectory, "package.json"),
    '{ "private": true, "type": "module" }\n',
  );

  const tsc = join(packageDirectory, "node_modules/typescript/bin/tsc");
  for (const [module, moduleResolution] of [
    ["nodenext", "nodenext"],
    ["esnext", "bundler"],
  ]) {
    run(
      process.execPath,
      [
        tsc,
        "--noEmit",
        "--strict",
        "--skipLibCheck",
        "--jsx",
        "react-jsx",
        "--module",
        module,
        "--moduleResolution",
        moduleResolution,
        "--target",
        "es2022",
        "--types",
        "react",
        "consumer.ts",
      ],
      temporaryDirectory,
    );
  }
}

try {
  const output = run("pnpm", [
    "pack",
    "--pack-destination",
    temporaryDirectory,
  ]);
  const tarball = output.split("\n").at(-1);
  if (!tarball?.endsWith(".tgz")) {
    throw new Error(`Could not identify packed tarball from: ${output}`);
  }

  run("tar", [
    "-xzf",
    resolve(packageDirectory, tarball),
    "-C",
    temporaryDirectory,
  ]);
  const packedDirectory = join(temporaryDirectory, "package");
  const manifest = JSON.parse(
    await readFile(join(packedDirectory, "package.json"), "utf8"),
  );

  assertNoLocalProtocols(manifest);
  assertAgentDocs(packedDirectory);

  for (const field of ["main", "module", "types"]) {
    const target = manifest[field];
    if (typeof target !== "string" || !target.startsWith("./dist/")) {
      throw new Error(`Packed ${field} must target dist; received ${target}.`);
    }
    assertFile(join(packedDirectory, target), field);
  }

  assertExportTargets(manifest.exports, "exports", packedDirectory);

  const rootImport = manifest.exports?.["."]?.import;
  const presetImport = manifest.exports?.["./tailwind-preset"]?.import;
  if (rootImport !== "./dist/index.js") {
    throw new Error(`Packed root import target is invalid: ${rootImport}.`);
  }
  if (presetImport !== "./dist/tailwind-preset.js") {
    throw new Error(`Packed tailwind preset target is invalid: ${presetImport}.`);
  }

  await assertResolvableRelativeSpecifiers(packedDirectory);
  await assertNodeResolution(manifest, packedDirectory);
  await assertTailwindMergeFree();
  await assertSubpathTypes(packedDirectory);

  console.log(
    `Packed web package resolves every export, internal ESM specifier, root entry, tailwind preset and subpath (runtime and types) from published files, and the plain exports bundle without tailwind-merge or class-variance-authority (${manifest.version}).`,
  );
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
