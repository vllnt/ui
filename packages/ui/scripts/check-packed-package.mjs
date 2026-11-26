import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
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

/** Names of the `@vllnt/ui/<name>` subpaths in a packed package. */
function packedSubpaths(packedDirectory) {
  const names = readdirSync(join(packedDirectory, "dist/subpaths"))
    .filter((file) => file.endsWith(".js"))
    .map((file) => file.slice(0, -".js".length));
  if (names.length === 0) throw new Error("Packed dist/subpaths is empty.");
  return names;
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
      // Every subpath resolves to its own entry and exports the same values as
      // the root, as the same module instances.
      `const subpaths = ${JSON.stringify(packedSubpaths(packedDirectory))};`,
      'const root = await import("@vllnt/ui");',
      "for (const name of subpaths) {",
      '  const resolved = import.meta.resolve(`@vllnt/ui/${name}`);',
      '  if (!resolved.endsWith(`/dist/subpaths/${name}.js`)) throw new Error(`Invalid subpath entry: ${resolved}`);',
      "  const subpath = await import(`@vllnt/ui/${name}`);",
      "  for (const [key, value] of Object.entries(subpath)) {",
      '    if (root[key] !== value) throw new Error(`@vllnt/ui/${name} exports ${key}, which differs from the root export.`);',
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
 * Type-checks a consumer that imports a type and a value from every subpath,
 * under the two module resolutions consumers use.
 */
async function assertSubpathTypes(packedDirectory) {
  const nodeModulesDirectory = join(temporaryDirectory, "node_modules");
  await Promise.all(
    ["@types/react", "@types/react-dom"].map((name) =>
      linkInstalledPackage(name, nodeModulesDirectory),
    ),
  );
  const lines = packedSubpaths(packedDirectory).map(
    (name, index) => `import * as subpath${index} from "@vllnt/ui/${name}";`,
  );
  lines.push(
    'import { Button, type ButtonProps } from "@vllnt/ui/button";',
    'import { cn } from "@vllnt/ui/utils";',
    "const props: ButtonProps = { variant: \"outline\" };",
    "export const checked = [Button, cn, props, " +
      lines.map((_, index) => `subpath${index}`).join(", ") +
      "];",
    "",
  );
  await writeFile(join(temporaryDirectory, "consumer.ts"), lines.join("\n"));

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
  await assertSubpathTypes(packedDirectory);

  console.log(
    `Packed web package resolves every export, internal ESM specifier, root entry, tailwind preset and subpath (runtime and types) from published files (${manifest.version}).`,
  );
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
