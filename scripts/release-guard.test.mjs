import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { packageRelease, releaseVersion } from "./release-guard.mjs";

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
test("stable publish step: an exact version skips, E404 publishes, any other lookup answer aborts", () => {
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
      ["exit 0", 1, false],
      ["echo 0.4.1", 1, false],
      ["echo 'npm warn deprecated x' >&2", 1, false],
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
test("npm-published.sh: yes only for the exact version, no only for E404, everything else fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "npm-published-"));
  const script = fileURLToPath(new URL("npm-published.sh", import.meta.url));
  const run = (view, spec = "@vllnt/ui@0.4.0") => {
    writeFileSync(join(dir, "npm"), `#!/usr/bin/env bash\n${view}\n`, { mode: 0o755 });
    return spawnSync("bash", [script, spec], { encoding: "utf8", env: { ...process.env, PATH: `${dir}:${process.env.PATH}` } });
  };
  const cases = [
    ["echo 0.4.0", 0, "yes"],
    ["echo 0.4.0; echo 'npm warn config x' >&2", 0, "yes"],
    ["echo 0.4.1", 1, ""],
    ["printf '0.4.0\\n0.4.1\\n'", 1, ""],
    ["exit 0", 1, ""],
    ["echo 'npm warn deprecated @vllnt/ui@0.4.0: x' >&2", 1, ""],
    ["echo 'npm error code E404' >&2; exit 1", 0, "no"],
    ["echo 'npm error code E500' >&2; exit 1", 1, ""],
    ["echo 'npm error code ETIMEDOUT' >&2; exit 1", 1, ""],
    ["exit 1", 1, ""],
  ];
  try {
    for (const [view, status, stdout] of cases) {
      const result = run(view);
      assert.equal(result.status, status, view);
      assert.equal(result.stdout.trim(), stdout, view);
    }
    assert.equal(run("echo 0.4.0", "@vllnt/ui").status, 2);
    assert.equal(run("echo 0.4.0", "").status, 2);
    assert.match(run("echo 0.4.1").stderr, /expected '0\.4\.0'/);
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

const nativeInput = {
  ref: "refs/tags/ui-native-v0.2.0",
  versions: { "ui-core": "0.1.0", "ui-native": "0.2.0" },
  changelogs: { "ui-core": "# Changelog\n## [0.1.0] - 2026-11-03\n", "ui-native": "# Changelog\n## [Unreleased]\n## [0.2.0] - 2026-11-03\n" },
  onMain: true,
};
test("package tags release ui-core and ui-native stable only", () => {
  assert.deepEqual(packageRelease({ ...nativeInput }), { dir: "ui-native", name: "@vllnt/ui-native", version: "0.2.0" });
  assert.deepEqual(packageRelease({ ...nativeInput, ref: "refs/tags/ui-core-v0.1.0" }), { dir: "ui-core", name: "@vllnt/ui-core", version: "0.1.0" });
});
test("package tags reject other tags, prereleases, wrong versions, off-main commits and missing changelog entries", () => {
  const bad = (changes, message) => assert.throws(() => packageRelease({ ...nativeInput, ...changes }), message);
  for (const ref of ["refs/tags/v0.2.0", "refs/tags/v0.4.0", "refs/heads/main", "refs/tags/ui-native-0.2.0", "refs/tags/ui-web-v0.2.0", "refs/tags/ui-native-v0.2.0/x", "", undefined]) {
    bad({ ref }, /requires a ui-core-v/);
  }
  for (const version of ["0.2.0-canary.1", "0.2.0-rc.1", "0.2", "0.2.00", "02.0.0", "0.2.0+build"]) {
    bad({ ref: `refs/tags/ui-native-v${version}`, versions: { ...nativeInput.versions, "ui-native": version } }, /not stable/);
  }
  bad({ ref: "refs/tags/ui-native-v0.2.1" }, /does not match packages\/ui-native version 0.2.0/);
  bad({ ref: "refs/tags/ui-native-v0.1.0" }, /does not match/);
  bad({ ref: "refs/tags/ui-core-v0.2.0" }, /does not match packages\/ui-core version 0.1.0/);
  bad({ onMain: false }, /not on origin\/main/);
  bad({ onMain: undefined }, /not on origin\/main/);
  bad({ changelogs: { ...nativeInput.changelogs, "ui-native": "## [Unreleased]\n## [0.2.01]\n## [0.2.0-rc.1]\n## 0.2.0\n" } }, /no ## \[0\.2\.0\] section/);
  bad({ ref: "refs/tags/ui-core-v0.1.0", changelogs: { ...nativeInput.changelogs, "ui-core": "" } }, /no ## \[0\.1\.0\] section/);
});
test("a Web v tag never reaches the package guard or the native workflow, and package tags never reach Web", () => {
  const nativeTags = ["refs/tags/ui-core-v0.1.0", "refs/tags/ui-native-v0.2.0"];
  for (const ref of nativeTags) {
    assert.throws(() => releaseVersion({ ...input, mode: "stable", ref }), /requires tag/);
    assert.ok(!ref.startsWith("refs/tags/v"));
  }
  // GitHub tag filters are anchored globs: `*` matches any run of characters except `/`.
  const matches = (pattern, name) => new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")}$`).test(name);
  const patterns = (file) => JSON.parse(read(`.github/workflows/${file}`).match(/tags: (\[.*\])/)[1]);
  const web = patterns("publish.yml");
  const native = patterns("native-release.yml");
  assert.deepEqual(native, ["ui-core-v*.*.*", "ui-native-v*.*.*"]);
  for (const name of ["ui-core-v0.1.0", "ui-native-v0.2.0", "ui-native-v1.2.3-rc.1"]) {
    assert.ok(native.some((p) => matches(p, name)), name);
    assert.ok(!web.some((p) => matches(p, name)), name);
  }
  for (const name of ["v0.4.0", "v1.2.3", "v0.1.0"]) {
    assert.ok(web.some((p) => matches(p, name)), name);
    assert.ok(!native.some((p) => matches(p, name)), name);
  }
});
test("package-release CLI checks the tagged commit against origin/main in git", () => {
  const dir = mkdtempSync(join(tmpdir(), "package-release-"));
  const git = (...args) => spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.com", "-c", "commit.gpgsign=false", ...args], { cwd: dir, encoding: "utf8" });
  try {
    mkdirSync(join(dir, "scripts"));
    copyFileSync(fileURLToPath(new URL("release-guard.mjs", import.meta.url)), join(dir, "scripts/release-guard.mjs"));
    for (const [name, version] of [["ui", "0.4.0"], ["ui-core", "0.1.0"], ["ui-native", "0.2.0"]]) {
      mkdirSync(join(dir, "packages", name), { recursive: true });
      writeFileSync(join(dir, "packages", name, "package.json"), JSON.stringify({ name, version }));
      writeFileSync(join(dir, "packages", name, "CHANGELOG.md"), `## [Unreleased]\n## [${version}] - 2026-11-03\n`);
    }
    git("init", "-q");
    git("add", ".");
    git("commit", "-q", "-m", "release");
    const main = git("rev-parse", "HEAD").stdout.trim();
    git("update-ref", "refs/remotes/origin/main", main);
    git("commit", "-q", "--allow-empty", "-m", "off main");
    const offMain = git("rev-parse", "HEAD").stdout.trim();
    const run = (ref, sha) => spawnSync("node", ["scripts/release-guard.mjs", "package-release"], { cwd: dir, encoding: "utf8", env: { ...process.env, GITHUB_REF: ref, GITHUB_SHA: sha } });
    const ok = run("refs/tags/ui-native-v0.2.0", main);
    assert.equal(ok.status, 0, ok.stderr);
    assert.equal(ok.stdout, "name=@vllnt/ui-native\ndir=packages/ui-native\nversion=0.2.0\n");
    for (const [ref, sha, message] of [
      ["refs/tags/ui-native-v0.2.0", offMain, /not on origin\/main/],
      ["refs/tags/ui-native-v0.2.0", "bad", /Invalid commit SHA/],
      ["refs/tags/ui-native-v0.2.1", main, /does not match/],
      ["refs/tags/v0.4.0", main, /requires a ui-core-v/],
    ]) {
      const result = run(ref, sha);
      assert.equal(result.status, 1, ref);
      assert.equal(result.stdout, "");
      assert.match(result.stderr, message);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("native release workflow: gates before approval, OIDC publish with provenance, no tags or canary overlap", () => {
  const workflow = read(".github/workflows/native-release.yml");
  const quality = workflow.slice(workflow.indexOf("  quality:"), workflow.indexOf("  release:"));
  const release = workflow.slice(workflow.indexOf("  release:"));
  assert.match(workflow, /^permissions:\n {2}contents: read$/m);
  assert.doesNotMatch(workflow, /branches:|workflow_dispatch|git tag|git push|pull_request/);
  assert.doesNotMatch(workflow, /npm@latest|secrets\./);
  assert.match(workflow, /group: native-release-\$\{\{ github\.ref \}\}\n {2}cancel-in-progress: false/);
  assert.doesNotMatch(quality, /id-token|environment:/);
  assert.match(quality, /fetch-depth: 0/);
  assert.match(quality, /release-guard\.mjs package-release >> "\$GITHUB_OUTPUT"/);
  assert.match(quality, /node --test scripts\/release-guard\.test\.mjs/);
  assert.match(release, /needs: quality/);
  assert.match(release, /environment: npm-release/);
  assert.match(release, /permissions:\n {6}contents: read\n {6}id-token: write/);
  assert.equal(workflow.match(/id-token: write/g).length, 1);
  assert.match(release, /npx --yes npm@11\.18\.0 publish "\$TARBALL" --tag latest --provenance --access public/);
  for (const use of workflow.match(/uses: .+/g)) assert.match(use, /@[a-f0-9]{40} # v/);
  assert.match(read(".github/workflows/native-canary.yml"), /if: \$\{\{ false \}\}/);
});
test("native publish step: skips published versions, requires the exact ui-core on npm, aborts on lookup errors", () => {
  const workflow = read(".github/workflows/native-release.yml");
  const step = workflow.match(/- name: Publish to npm\n[\s\S]*?\n {8}run: \|\n([\s\S]*)$/)?.[1];
  assert.ok(step, "Publish to npm step must exist in native-release.yml");
  const script = step.replace(/^ {10}/gm, "");
  const dir = mkdtempSync(join(tmpdir(), "native-publish-"));
  const bin = (name, body) => writeFileSync(join(dir, name), `#!/usr/bin/env bash\n${body}\n`, { mode: 0o755 });
  mkdirSync(join(dir, "packages/ui-core"), { recursive: true });
  writeFileSync(join(dir, "packages/ui-core/package.json"), JSON.stringify({ name: "@vllnt/ui-core", version: "0.1.0" }));
  writeFileSync(join(dir, "npmrc"), "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}\n");
  // The stub pnpm packs a tarball whose manifest is $PACKED_MANIFEST, as pnpm would after rewriting workspace:*.
  bin("pnpm", `mkdir -p "${dir}/pack/package"\necho "$PACKED_MANIFEST" > "${dir}/pack/package/package.json"\ntar -czf "${dir}/pack.tgz" -C "${dir}/pack" package\necho "${dir}/pack.tgz"`);
  bin("npx", 'shift 2; exec npm "$@"');
  const missing = "echo 'npm error code E404' >&2; exit 1";
  const manifest = (dependencies) => JSON.stringify({ name: "@vllnt/ui-native", version: "0.2.0", dependencies });
  const run = ({ self = missing, core = "echo 0.1.0", packed = manifest({ "@vllnt/ui-core": "0.1.0" }), pkg = "@vllnt/ui-native" }) => {
    bin("npm", `if [ "$1" = view ]; then case "$2" in @vllnt/ui-core@*) ${core};; *) ${self};; esac; fi\nif [ "$1" = publish ]; then echo "$@" >> "${dir}/published"; fi`);
    rmSync(join(dir, "published"), { force: true });
    const result = spawnSync("bash", ["-e", "-c", script], {
      cwd: dir,
      encoding: "utf8",
      env: {
        ...process.env, PATH: `${dir}:${process.env.PATH}`, NPM_CONFIG_USERCONFIG: join(dir, "npmrc"), GITHUB_WORKSPACE: fileURLToPath(new URL("..", import.meta.url)),
        PKG: pkg, PKG_DIR: "packages/ui-native", VERSION: "0.2.0", PACKED_MANIFEST: packed,
      },
    });
    let published = "";
    try { published = readFileSync(join(dir, "published"), "utf8"); } catch {}
    return { status: result.status, published, output: result.stdout + result.stderr };
  };
  try {
    const publishes = (result) => result.published.trim().replace(dir, "");
    assert.match(publishes(run({})), /^publish \/pack\.tgz --tag latest --provenance --access public$/);
    for (const self of ["exit 0", "echo 0.2.1", "echo 'npm warn x' >&2"]) {
      assert.deepEqual([run({ self }).status, run({ self }).published], [1, ""], self);
    }
    assert.deepEqual([run({ self: "echo 0.2.0" }).status, run({ self: "echo 0.2.0" }).published], [0, ""]);
    for (const self of ["echo 'npm error code ETIMEDOUT' >&2; exit 1", "echo 'npm error code E403' >&2; exit 1"]) {
      assert.deepEqual([run({ self }).status, run({ self }).published], [1, ""], self);
    }
    // ui-core 0.1.0 must already be on npm: an unpublished or unverifiable core never publishes native.
    const notPublished = run({ core: missing });
    assert.equal(notPublished.status, 1);
    assert.equal(notPublished.published, "");
    assert.match(notPublished.output, /@vllnt\/ui-core@0\.1\.0 is not on npm; tag ui-core-v0\.1\.0 first/);
    for (const core of ["echo 'npm error code E503' >&2; exit 1", "exit 0", "echo 0.1.1"]) {
      assert.deepEqual([run({ core }).status, run({ core }).published], [1, ""], core);
    }
    // The packed manifest must carry the exact core version and no workspace protocol.
    for (const packed of [manifest({ "@vllnt/ui-core": "workspace:*" }), manifest({ "@vllnt/ui-core": "^0.1.0" }), manifest({}), manifest({ "@vllnt/ui-core": "0.1.0", other: "workspace:^" })]) {
      const result = run({ packed });
      assert.equal(result.status, 1, packed);
      assert.equal(result.published, "", packed);
      assert.match(result.output, /Packed manifest mismatch/);
    }
    // ui-core has no core dependency; only its own lookup (E404 here) matters.
    const corePkg = run({ pkg: "@vllnt/ui-core", packed: JSON.stringify({ name: "@vllnt/ui-core", version: "0.2.0" }), core: missing });
    assert.equal(corePkg.status, 0, corePkg.output);
    assert.match(corePkg.published, /^publish /);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
