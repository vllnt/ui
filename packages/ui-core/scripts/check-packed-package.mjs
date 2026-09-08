import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const packageDirectory = resolve(import.meta.dirname, "..");
const temporaryDirectory = await mkdtemp(join(tmpdir(), "vllnt-ui-core-pack-"));

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

  for (const field of ["main", "module", "types"]) {
    const target = manifest[field];
    if (typeof target !== "string" || target.startsWith("./src/")) {
      throw new Error(`Packed ${field} must target dist; received ${target}.`);
    }
    await assertFile(join(packedDirectory, target), field);
  }

  const rootExport = manifest.exports?.["."];
  for (const condition of ["import", "types"]) {
    const target = rootExport?.[condition];
    if (typeof target !== "string" || target.startsWith("./src/")) {
      throw new Error(
        `Packed exports[\".\"].${condition} must target dist; received ${target}.`,
      );
    }
    await assertFile(join(packedDirectory, target), `exports.${condition}`);
  }

  const tokensExport = manifest.exports?.["./tokens.json"];
  const contractsExport = manifest.exports?.["./contracts.json"];
  if (tokensExport !== "./tokens.json") {
    throw new Error(`Packed tokens export is invalid: ${tokensExport}.`);
  }
  if (contractsExport !== "./component-contracts.json") {
    throw new Error(`Packed contracts export is invalid: ${contractsExport}.`);
  }
  await assertFile(join(packedDirectory, tokensExport), "tokens export");
  await assertFile(join(packedDirectory, contractsExport), "contracts export");

  console.log(
    `Packed core package resolves runtime, types, tokens, and contracts from published files (${manifest.version}).`,
  );
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
