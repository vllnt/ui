import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { releaseVersion } from "./release-guard.mjs";

const input = { web: "0.4.0", core: "0.1.0", native: "0.1.0", ref: "refs/heads/main", sha: "a".repeat(40), run: "42" };
const tag = (web) => `refs/tags/v${web}`;
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("stable rejects newer bases, prereleases and unknown channels", () => {
  for (const web of ["0.5.0", "1.0.0", "0.4.0-canary.1", "0.4.01", "0.2.9"]) {
    assert.throws(() => releaseVersion({ ...input, web, mode: "stable", ref: tag(web) }), /Unsupported Web release base/);
  }
  for (const mode of ["latest", "release", "next", ""]) assert.throws(() => releaseVersion({ ...input, mode }));
});
test("stable 0.4 release and 0.3 maintenance publish from their own v tag only", () => {
  for (const web of ["0.4.0", "0.4.1", "0.3.1"]) {
    assert.equal(releaseVersion({ ...input, web, mode: "stable", ref: tag(web) }), web);
    const wrongRefs = ["refs/heads/main", "refs/heads/other", "refs/tags/v0.4.9", `refs/tags/${web}`, `refs/tags/v${web}-rc.1`, `refs/tags/v${web}1`, "", undefined];
    for (const ref of wrongRefs) assert.throws(() => releaseVersion({ ...input, web, mode: "stable", ref }), /requires tag/);
  }
});
test("canaries publish from main only, never from a tag", () => {
  for (const mode of ["web-canary", "native-canary"]) {
    for (const ref of ["refs/heads/other", tag("0.4.0"), "", undefined]) {
      assert.throws(() => releaseVersion({ ...input, mode, ref }), /requires main/);
    }
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
  assert.match(web, /release-guard\.mjs stable[\s\S]*--tag latest/);
  assert.ok(web.indexOf("release-guard.mjs web-canary") < web.indexOf('npm version "$CANARY_VERSION"'));
  assert.match(web, /publish "\$TARBALL" --tag canary/);
  assert.match(web, /publish "\$TARBALL" --tag latest/);
  const canary = web.slice(web.indexOf("  canary:"), web.indexOf("  release:"));
  const release = web.slice(web.indexOf("  release:"));
  assert.match(release, /environment: npm-release/);
  assert.match(web, /tags: \["v\*\.\*\.\*"\]/);
  assert.doesNotMatch(web, /workflow_dispatch|git tag|git push/);
  assert.match(canary, /if: github\.ref == 'refs\/heads\/main'/);
  assert.match(release, /if: startsWith\(github\.ref, 'refs\/tags\/v'\)/);
  assert.match(release, /git merge-base --is-ancestor "\$GITHUB_SHA" origin\/main/);
  assert.match(release, /persist-credentials: false/);
  assert.match(release, /gh release create "\$TAG" --verify-tag/);
  assert.ok(native.indexOf("release-guard.mjs native-canary") < native.indexOf("npm@11.18.0 whoami"));
  assert.match(native, /--tag "\$STAGING_TAG"/);
  assert.doesNotMatch(native, /--tag latest|workflow_dispatch|scripts\/native-canary/);
  assert.match(native, /if: \$\{\{ false \}\}/);
  assert.match(native, /dist-tag add "@vllnt\/ui-native@\$\{CANARY_VERSION\}" canary/);
  for (const workflow of [web, native]) assert.match(workflow, /node --test scripts\/release-guard.test.mjs/);
});
test("release notes come from the exact CHANGELOG section of the released version", () => {
  const program = read(".github/workflows/publish.yml").match(/awk -v version="\$VERSION" '([^']+)' CHANGELOG\.md/)?.[1];
  assert.ok(program, "release notes awk program must exist in publish.yml");
  const changelog = [
    "# Changelog", "## [Unreleased]", "- next", "## [0.4.10] - 2026-11-02", "- ten", "## [0.4.1] - 2026-11-01", "- one", "- more",
    "## [0.4.0-rc.1]", "- rc", "## [0.4.0] - 2026-10-31", "- zero", "## [0.3.0] - 2026-06-26", "- old", "",
  ].join("\n");
  const notes = (version) => spawnSync("awk", ["-v", `version=${version}`, program], { input: changelog, encoding: "utf8" }).stdout;
  assert.equal(notes("0.4.1"), "- one\n- more\n");
  assert.equal(notes("0.4.0"), "- zero\n");
  assert.equal(notes("0.4.2"), "");
});
test("stable publish step treats only a registry E404 as unpublished", () => {
  const web = read(".github/workflows/publish.yml");
  const step = web.match(/- name: Publish to npm\n[\s\S]*?\n {8}run: \|\n([\s\S]*?)\n\n {6}- name:/)?.[1];
  assert.ok(step, "Publish to npm step must exist in publish.yml");
  const script = step.replace(/^ {10}/gm, "");
  const dir = mkdtempSync(join(tmpdir(), "publish-step-"));
  const bin = (name, body) => writeFileSync(join(dir, name), `#!/usr/bin/env bash\n${body}\n`, { mode: 0o755 });
  bin("pnpm", "echo /tmp/vllnt-ui-0.4.0.tgz");
  bin("npx", 'shift 2; exec npm "$@"');
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "@vllnt/ui", version: "0.4.0" }));
  writeFileSync(join(dir, "npmrc"), "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}\n");
  const run = (view) => {
    bin("npm", `if [ "$1" = view ]; then ${view}; fi\nif [ "$1" = publish ]; then echo "$@" >> "${dir}/published"; fi`);
    rmSync(join(dir, "published"), { force: true });
    const result = spawnSync("bash", ["-e", "-c", script], {
      cwd: dir,
      encoding: "utf8",
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, VERSION: "0.4.0", NPM_CONFIG_USERCONFIG: join(dir, "npmrc"), GITHUB_WORKSPACE: fileURLToPath(new URL("..", import.meta.url)) },
    });
    let published = "";
    try { published = readFileSync(join(dir, "published"), "utf8"); } catch {}
    return { status: result.status, published };
  };
  try {
    const cases = [
      ["echo 0.4.0", 0, false],
      ["exit 0", 0, true],
      ["echo 'npm error code E404' >&2; exit 1", 0, true],
      ["echo 'npm error code ETIMEDOUT' >&2; exit 1", 1, false],
      ["echo 'npm error code E503' >&2; exit 1", 1, false],
      ["echo 'npm error code E403' >&2; exit 1", 1, false],
    ];
    for (const [view, status, publishes] of cases) {
      const result = run(view);
      assert.equal(result.status, status, view);
      assert.equal(result.published !== "", publishes, view);
      if (publishes) assert.match(result.published, /publish \/tmp\/vllnt-ui-0\.4\.0\.tgz --tag latest --provenance --access public/);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
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
