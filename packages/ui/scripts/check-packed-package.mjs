import { spawnSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
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
    throw new Error(`${command} ${arguments_.join(" ")} failed.`);
  }
  return result.stdout.trim();
}

async function assertFile(path, field) {
  try {
    const metadata = await stat(path);
    if (!metadata.isFile()) throw new Error();
  } catch {
    throw new Error(`Packed ${field} target is missing: ${path}`);
  }
}

async function assertExportTargets(value, path, packedDirectory) {
  if (typeof value === "string") {
    if (!value.startsWith("./") || value.startsWith("./src/")) {
      throw new Error(`Packed ${path} has an invalid target: ${value}.`);
    }
    await assertFile(join(packedDirectory, value), path);
    return;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Packed ${path} must contain file targets.`);
  }

  await Promise.all(
    Object.entries(value).map(([key, target]) =>
      assertExportTargets(target, `${path}.${key}`, packedDirectory),
    ),
  );
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
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(relativeSpecifierPattern)) {
      const specifier = match[3];
      await assertFile(
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

  const optionalPeers = new Set(
    Object.entries(manifest.peerDependenciesMeta ?? {})
      .filter(([, metadata]) => metadata?.optional === true)
      .map(([name]) => name),
  );
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
      "",
    ].join("\n"),
  );
  run(process.execPath, [consumer], temporaryDirectory);
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
    await assertFile(join(packedDirectory, target), field);
  }

  await assertExportTargets(manifest.exports, "exports", packedDirectory);

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

  console.log(
    `Packed web package resolves every export, internal ESM specifier, root entry, and tailwind preset from published files (${manifest.version}).`,
  );
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
