import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { releaseVersion } from "./release-guard.mjs";

const input = { web: "0.4.0", core: "0.1.0", native: "0.1.0", ref: "refs/heads/main", sha: "a".repeat(40), run: "42" };
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("stable hold cannot be bypassed by a newer version or channel", () => {
  for (const web of ["0.4.0", "0.4.1", "0.5.0", "1.0.0", "0.4.0-canary.1"]) {
    assert.throws(() => releaseVersion({ ...input, web, mode: "stable" }));
  }
  for (const mode of ["latest", "release", "next", ""]) assert.throws(() => releaseVersion({ ...input, mode }));
});
test("existing stable 0.3 maintenance is preserved on main only", () => {
  assert.equal(releaseVersion({ ...input, web: "0.3.1", mode: "stable" }), "0.3.1");
  for (const mode of ["stable", "web-canary", "native-canary"]) {
    assert.throws(() => releaseVersion({ ...input, web: "0.3.1", mode, ref: "refs/heads/other" }));
  }
});
test("canaries derive prerelease versions from validated inputs", () => {
  assert.equal(releaseVersion({ ...input, mode: "web-canary" }), "0.4.0-canary.shaaaaaaaa");
  assert.equal(releaseVersion({ ...input, sha: "0123456" + "a".repeat(33), mode: "web-canary" }), "0.4.0-canary.sha0123456");
  assert.equal(releaseVersion({ ...input, mode: "native-canary" }), "0.1.0-canary.42.shaaaaaaaaaaaaa");
  for (const changes of [{ core: "0.4.0" }, { native: "0.1.1" }, { run: "0" }, { sha: "bad" }]) {
    assert.throws(() => releaseVersion({ ...input, ...changes, mode: "native-canary" }));
  }
});
test("checked-in bases, availability and stable install pin remain coherent", () => {
  assert.equal(JSON.parse(read("packages/ui/package.json")).version, "0.4.0");
  for (const name of ["ui-core", "ui-native"]) assert.equal(JSON.parse(read(`packages/${name}/package.json`)).version, "0.1.0");
  const native = JSON.parse(read("packages/ui-native/registry.json"));
  assert.equal(native.installation.available, false);
  assert.match(read("apps/registry/scripts/inline-component-source.ts"), /PUBLISHED_VERSION = "0\.3\.0"/);
});
test("workflow guards precede mutations and channels stay explicit", () => {
  const web = read(".github/workflows/publish.yml");
  const native = read(".github/workflows/native-canary.yml");
  assert.ok(web.indexOf("release-guard.mjs stable") < web.indexOf("git tag -a"));
  assert.ok(web.indexOf("release-guard.mjs web-canary") < web.indexOf('npm version "$CANARY_VERSION"'));
  assert.match(web, /publish "\$TARBALL" --tag canary/);
  assert.match(web, /publish "\$TARBALL" --tag latest/);
  assert.ok(native.indexOf("release-guard.mjs native-canary") < native.indexOf("npm@11.18.0 whoami"));
  assert.match(native, /--tag "\$STAGING_TAG"/);
  assert.doesNotMatch(native, /--tag latest|workflow_dispatch|scripts\/native-canary/);
  assert.match(native, /if: \$\{\{ false \}\}/);
  assert.match(native, /dist-tag add "@vllnt\/ui-native@\$\{CANARY_VERSION\}" canary/);
  for (const workflow of [web, native]) assert.match(workflow, /node --test scripts\/release-guard.test.mjs/);
});
test("native publisher distinguishes unpublished versions from registry failures", () => {
  const workflow = read(".github/workflows/native-canary.yml");
  const fn = workflow.match(/^( +)version_state\(\) \{\n[\s\S]*?^\1\}\n/m);
  assert.ok(fn, "version_state() must exist in native-canary.yml");
  const body = fn[0].replace(new RegExp(`^${fn[1]}`, "gm"), "");
  const dir = mkdtempSync(join(tmpdir(), "version-state-"));
  const npmStub = join(dir, "npm");
  const run = (stub) => {
    writeFileSync(npmStub, `#!/usr/bin/env bash\n${stub}\n`, { mode: 0o755 });
    return spawnSync("bash", ["-c", `set -euo pipefail\n${body}\nversion_state "@vllnt/ui-core@0.1.0-canary.1.shaaaaaaaaaaaaa"`], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, RUNNER_TEMP: dir },
    });
  };
  const cases = [
    ["echo 0.1.0-canary.1.shaaaaaaaaaaaaa", 0, "present"],
    ["exit 0", 0, "absent"],
    ["echo 'npm error code E404' >&2; exit 1", 0, "absent"],
    ["echo 'npm error code ETIMEDOUT' >&2; exit 1", 1, ""],
    ["echo 'npm error code E503' >&2; exit 1", 1, ""],
  ];
  try {
    for (const [stub, status, stdout] of cases) {
      const result = run(stub);
      assert.equal(result.status, status, stub);
      assert.equal(result.stdout.trim(), stdout, stub);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
