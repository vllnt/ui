import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

test("rejects web package subpaths without rejecting the native/core packages", async () => {
  const directory = await mkdtemp(join(tmpdir(), "native-boundary-test-"));
  try {
    await mkdir(join(directory, "scripts"));
    await mkdir(join(directory, "src"));
    const script = join(directory, "scripts/check-boundaries.mjs");
    await copyFile(new URL("./check-boundaries.mjs", import.meta.url), script);
    for (const specifier of ["@vllnt/ui", "@vllnt/ui/styles.css", "@vllnt/ui/themes/default.css"]) {
      await writeFile(join(directory, "src/example.ts"), `import '${specifier}';\n`);
      const result = spawnSync(process.execPath, [script], { encoding: "utf8" });
      assert.equal(result.status, 1, specifier);
      assert.match(result.stderr, /Native renderer boundary check failed/);
    }
    await writeFile(join(directory, "src/example.ts"), 'import "@vllnt/ui-core";\nimport "@vllnt/ui-native";\n');
    const result = spawnSync(process.execPath, [script], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
