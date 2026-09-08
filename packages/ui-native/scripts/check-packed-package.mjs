import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const packageDirectory = resolve(import.meta.dirname, "..");
const temporaryDirectory = await mkdtemp(join(tmpdir(), "vllnt-ui-native-pack-"));

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
  const entryFields = ["main", "module", "react-native", "types"];

  for (const field of entryFields) {
    const target = manifest[field];
    if (typeof target !== "string" || target.startsWith("./src/")) {
      throw new Error(`Packed ${field} must target dist; received ${target}.`);
    }
    await assertFile(join(packedDirectory, target), field);
  }

  const rootExport = manifest.exports?.["."];
  for (const condition of ["default", "import", "react-native", "types"]) {
    const target = rootExport?.[condition];
    if (typeof target !== "string" || target.startsWith("./src/")) {
      throw new Error(
        `Packed exports[\".\"].${condition} must target dist; received ${target}.`,
      );
    }
    await assertFile(join(packedDirectory, target), `exports.${condition}`);
  }

  const coreRange = manifest.dependencies?.["@vllnt/ui-core"];
  if (typeof coreRange !== "string" || coreRange.startsWith("workspace:")) {
    throw new Error(`Packed @vllnt/ui-core range is invalid: ${coreRange}.`);
  }

  console.log(
    `Packed native package resolves main, module, react-native, and types from dist (${manifest.version}).`,
  );
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
