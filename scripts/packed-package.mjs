import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

function run(command, arguments_, cwd) {
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

/** Throws unless `path` is a regular file in the packed package. */
export async function assertFile(path, field) {
  try {
    const metadata = await stat(path);
    if (!metadata.isFile()) throw new Error();
  } catch {
    throw new Error(`Packed ${field} target is missing: ${path}`);
  }
}

/**
 * Packs `packageDirectory` with pnpm, extracts it to a temporary directory,
 * and checks that the listed manifest fields and root export conditions
 * target existing files outside `./src/`. `verify(manifest, packedDirectory)`
 * runs any package-specific checks; the temporary directory is always removed.
 */
export async function checkPackedPackage({
  conditions,
  fields,
  name,
  packageDirectory,
  verify,
}) {
  const temporaryDirectory = await mkdtemp(
    join(tmpdir(), `vllnt-ui-${name}-pack-`),
  );
  try {
    const output = run(
      "pnpm",
      ["pack", "--pack-destination", temporaryDirectory],
      packageDirectory,
    );
    const tarball = output.split("\n").at(-1);
    if (!tarball?.endsWith(".tgz")) {
      throw new Error(`Could not identify packed tarball from: ${output}`);
    }

    run(
      "tar",
      ["-xzf", resolve(packageDirectory, tarball), "-C", temporaryDirectory],
      packageDirectory,
    );
    const packedDirectory = join(temporaryDirectory, "package");
    const manifest = JSON.parse(
      await readFile(join(packedDirectory, "package.json"), "utf8"),
    );

    for (const field of fields) {
      const target = manifest[field];
      if (typeof target !== "string" || target.startsWith("./src/")) {
        throw new Error(`Packed ${field} must target dist; received ${target}.`);
      }
      await assertFile(join(packedDirectory, target), field);
    }

    const rootExport = manifest.exports?.["."];
    for (const condition of conditions) {
      const target = rootExport?.[condition];
      if (typeof target !== "string" || target.startsWith("./src/")) {
        throw new Error(
          `Packed exports[\".\"].${condition} must target dist; received ${target}.`,
        );
      }
      await assertFile(join(packedDirectory, target), `exports.${condition}`);
    }

    await verify(manifest, packedDirectory);
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
}
