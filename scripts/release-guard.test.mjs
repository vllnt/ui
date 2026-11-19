import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { packageRelease, releaseVersion, stableDistTag } from "./release-guard.mjs";
import { BOOTSTRAP, CORE, NATIVE, OTHER_SHA, SHA, VERSION, createHarness } from "./publish-canary.harness.mjs";

const input = { web: "0.4.0", core: "0.1.0", native: "0.1.0", ref: "refs/heads/main", sha: "a".repeat(40), run: "42" };
const tag = (web) => `refs/tags/v${web}`;
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const script = fileURLToPath(new URL("./publish-canary.sh", import.meta.url));
const guard = fileURLToPath(new URL("./release-guard.mjs", import.meta.url));
/** One job's text, without comment lines, so wiring checks do not match prose. */
const job = (workflow, id) => {
  const start = workflow.indexOf(`\n  ${id}:\n`);
  assert.ok(start >= 0, `job ${id} must exist`);
  const rest = workflow.slice(start + 1);
  const end = rest.slice(1).search(/\n  [a-z][\w-]*:\n/);
  return (end < 0 ? rest : rest.slice(0, end + 1)).split("\n").filter((line) => !/^\s*#/.test(line)).join("\n");
};
/** The workflow-level `permissions:` block with comment lines dropped; "" when there is none. */
const topLevelPermissions = (workflow) => {
  const lines = workflow.split("\n").filter((line) => !/^\s*#/.test(line));
  const start = lines.findIndex((line) => /^permissions:/.test(line));
  if (start < 0) return "";
  const block = [lines[start]];
  for (const line of lines.slice(start + 1)) {
    if (!/^\s+\S/.test(line)) break;
    block.push(line);
  }
  return block.join("\n");
};
/** Job-level grants cannot be wider than this default, so it must stay read-only. */
const assertReadOnlyDefault = (workflow) =>
  assert.equal(topLevelPermissions(workflow), "permissions:\n  contents: read", "workflow-level permissions must be exactly contents: read");
const harness = (t, options) => {
  const h = createHarness(options);
  t.after(h.cleanup);
  return h;
};
const uploads = (result) => result.publishes.map(({ name, version, tag }) => [name, version, tag]);
// OIDC authenticates `npm publish` only, so a canary run must never reach for `dist-tag` or a login.
const distTagCalls = (result) => result.calls.filter((call) => ["dist-tag", "whoami"].includes(call.args[0]));
/** The script's text without comment lines, so checks do not match its prose. */
const code = (text) => text.split("\n").filter((line) => !/^\s*#/.test(line)).join("\n");
// The registry wait: 5 s first, doubling, capped at 30 s, as many sleeps as polls that found nothing.
const BACKOFF = [5, 10, 20, 30, 30, 30, 30, 30];
// Env that leaves the wait on its real defaults (the harness otherwise sets CANARY_POLL_SECONDS=0).
const DEFAULT_WAIT = { CANARY_POLL_SECONDS: undefined };
// How many times the script asked npm whether `name` at VERSION is there.
const versionPolls = (result, name) => result.calls.filter((call) => call.args[0] === "view" && call.args[1] === `${name}@${VERSION}`).length;
// npm can take minutes to serve an upload (run 44545188360). 20 is more than the 12 polls the wait once allowed.
const SLOW_NPM_POLLS = 20;

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
  for (const mode of ["web-canary", "native-canary", "core-canary"]) {
    for (const ref of ["refs/heads/other", tag("0.4.0"), "", undefined]) {
      assert.throws(() => releaseVersion({ ...input, mode, ref }), /requires main/);
    }
  }
});
test("canaries derive prerelease versions from validated inputs", () => {
  assert.equal(releaseVersion({ ...input, mode: "web-canary" }), "0.4.0-canary.shaaaaaaaa");
  assert.equal(releaseVersion({ ...input, sha: "0123456" + "a".repeat(33), mode: "web-canary" }), "0.4.0-canary.sha0123456");
  assert.equal(releaseVersion({ ...input, mode: "native-canary" }), `0.1.0-canary.42.sha${"a".repeat(12)}`);
  for (const changes of [{ core: "0.4.0" }, { native: "0.1.1" }, { run: "0" }, { sha: "bad" }]) {
    assert.throws(() => releaseVersion({ ...input, ...changes, mode: "native-canary" }));
  }
});
test("core canary uses the pair's version scheme and depends on ui-core alone", () => {
  assert.equal(releaseVersion({ ...input, mode: "core-canary" }), VERSION);
  assert.equal(releaseVersion({ ...input, mode: "core-canary" }), releaseVersion({ ...input, mode: "native-canary" }));
  // Neither the Web release base nor the Native base can hold it back.
  assert.equal(releaseVersion({ mode: "core-canary", core: "0.1.0", ref: input.ref, sha: input.sha, run: "7" }), `0.1.0-canary.7.sha${"a".repeat(12)}`);
  assert.equal(releaseVersion({ ...input, web: "9.9.9", native: "0.2.0", mode: "core-canary" }), VERSION);
  for (const changes of [
    { core: "0.1.1" }, { core: "0.2.0" }, { core: "0.1.0-canary.1" }, { core: undefined },
    { run: "0" }, { run: "07" }, { run: undefined }, { sha: "bad" }, { sha: "A".repeat(40) }, { sha: undefined },
    { ref: "refs/heads/other" }, { ref: undefined },
  ]) {
    assert.throws(() => releaseVersion({ ...input, ...changes, mode: "core-canary" }), undefined, JSON.stringify(changes));
  }
});
test("core-canary CLI reads ui-core and accepts no overrides", () => {
  const env = { ...process.env, GITHUB_REF: "refs/heads/main", GITHUB_SHA: SHA, GITHUB_RUN_NUMBER: "7" };
  const ok = spawnSync(process.execPath, [guard, "core-canary"], { encoding: "utf8", env });
  assert.equal(ok.status, 0, ok.stderr);
  assert.equal(ok.stdout.trim(), `0.1.0-canary.7.sha${"a".repeat(12)}`);
  assert.notEqual(spawnSync(process.execPath, [guard, "core-canary", "0.2.0"], { encoding: "utf8", env }).status, 0);
  assert.notEqual(spawnSync(process.execPath, [guard, "core-canary"], { encoding: "utf8", env: { ...env, GITHUB_REF: "refs/heads/x" } }).status, 0);
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
  const publisher = read("scripts/publish-canary.sh");
  assert.match(web, /release-guard\.mjs stable[\s\S]*release-guard\.mjs dist-tag[\s\S]*--tag "\$DIST_TAG"/);
  assert.ok(web.indexOf("release-guard.mjs web-canary") < web.indexOf('npm version "$CANARY_VERSION"'));
  assert.match(web, /publish "\$TARBALL" --tag canary/);
  assert.match(web, /publish "\$TARBALL" --tag "\$DIST_TAG"/);
  assert.doesNotMatch(web, /--tag latest/);
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
  assert.ok(publisher.indexOf("release-guard.mjs core-canary") < publisher.indexOf('npm version "$CANARY_VERSION"'));
  assert.ok(publisher.indexOf("release-guard.mjs native-canary") < publisher.lastIndexOf('npm version "$CANARY_VERSION"'));
  assert.ok(publisher.indexOf("release-guard.mjs native-canary") < publisher.indexOf('publish_tarball "$core_tarball"'));
  // Every upload, on both paths, goes straight to the canary tag over OIDC: no latest, no staging
  // tag, no dist-tag command and no token (OIDC authenticates `npm publish` only).
  const tags = [...code(publisher).matchAll(/publish_tarball "[^"]+" (\S+)/g)].map((match) => match[1]);
  assert.deepEqual(tags, ["canary", "canary", "canary"]);
  assert.doesNotMatch(code(publisher), /--tag latest|dist-tag (add|rm|ls)|npm_with_token|whoami|STAGING_TAG|NPM_DIST_TAG_TOKEN/);
  assert.doesNotMatch(native, /--tag latest|workflow_dispatch|scripts\/native-canary|if: \$\{\{ false \}\}/);
  for (const workflow of [web, native]) assert.match(workflow, /node --test scripts\/release-guard.test.mjs/);
});
test("stable dist-tag: only a version above npm latest takes latest; an older line never moves it", () => {
  assert.equal(stableDistTag("0.4.0", "0.3.0"), "latest");
  assert.equal(stableDistTag("0.4.1", "0.4.0"), "latest");
  assert.equal(stableDistTag("0.10.0", "0.9.9"), "latest");
  assert.equal(stableDistTag("0.3.1", "0.4.1"), "release-0.3");
  assert.equal(stableDistTag("0.4.9", "0.4.10"), "release-0.4");
  assert.throws(() => stableDistTag("0.4.0", "0.4.0"), /already the npm latest/);
  for (const [version, latest] of [["0.4.0", ""], ["0.4.0", undefined], ["0.4.0-rc.1", "0.3.0"], ["0.4.0", "0.4.0-canary.shaabc"], ["v0.4.0", "0.3.0"]]) {
    assert.throws(() => stableDistTag(version, latest), /Expected a stable x\.y\.z/);
  }
  const cli = (env) => spawnSync(process.execPath, [guard, "dist-tag"], { encoding: "utf8", env: { ...process.env, ...env } });
  assert.equal(cli({ RELEASE_VERSION: "0.3.1", NPM_LATEST: "0.4.1" }).stdout.trim(), "release-0.3");
  assert.equal(cli({ RELEASE_VERSION: "0.4.0", NPM_LATEST: "" }).status, 1);
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
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, VERSION: "0.4.0", DIST_TAG: "latest", NPM_CONFIG_USERCONFIG: join(dir, "npmrc"), GITHUB_WORKSPACE: fileURLToPath(new URL("..", import.meta.url)) },
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
    // Only an exact version reaches npm; everything else exits 2 without calling it.
    const calls = join(dir, "calls");
    const called = (spec) => {
      rmSync(calls, { force: true });
      const result = run(`echo called >> "${calls}"; echo 0.4.0`, spec);
      let made = false;
      try { readFileSync(calls); made = true; } catch {}
      return { status: result.status, made };
    };
    for (const spec of ["@vllnt/ui@latest", "@vllnt/ui@^0.4.0", "@vllnt/ui@~0.4.0", "@vllnt/ui@0.4", "@vllnt/ui@0.4.x", "@vllnt/ui@>=0.4.0", "@vllnt/ui@", "@vllnt/ui", "@vllnt/ui@0.4.0@1.0.0", "@vllnt/ui@v0.4.0", "@vllnt/ui@0.4.0 ", "@0.4.0", "ui@@0.4.0", "@vllnt/@0.4.0", "", "ui"]) {
      assert.deepEqual(called(spec), { status: 2, made: false }, JSON.stringify(spec));
    }
    for (const spec of ["@vllnt/ui@0.4.0", "ui@0.4.0", "@vllnt/ui-core@0.1.0-canary.1.sha0123456789ab", "@vllnt/ui@1.0.0-rc.1+build.5"]) {
      const result = called(spec);
      assert.ok(result.made && result.status !== 2, spec);
    }
    assert.match(run("echo 0.4.1").stderr, /expected '0\.4\.0'/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("core canary is gated on ui-core alone, and each publish path has its own switch", () => {
  const workflow = read(".github/workflows/native-canary.yml");
  const [coreQuality, corePublish, nativeQuality, nativePublish] =
    ["core-quality", "core-publish", "native-quality", "native-publish"].map((id) => job(workflow, id));
  // Core: no Expo, no native package, no native gate.
  for (const block of [coreQuality, corePublish]) assert.doesNotMatch(block, /ci:native|expo|ui-native|native-catalog|native-quality/i);
  assert.match(coreQuality, /pnpm install --frozen-lockfile --filter '@vllnt\/ui-core\.\.\.'/);
  for (const gate of ["lint", "typecheck", "build", "test:once", "pack:check"]) assert.match(coreQuality, new RegExp(`pnpm -F @vllnt/ui-core ${gate}\\n`));
  assert.match(corePublish, /\n    needs: core-quality\n/);
  assert.match(corePublish, /if: \$\{\{ vars\.CORE_CANARY_PUBLISH_ENABLED == 'true' \}\}/);
  assert.match(corePublish, /bash scripts\/publish-canary\.sh core\n/);
  assert.doesNotMatch(corePublish, /NPM_DIST_TAG_TOKEN|NATIVE_CANARY/);
  // Native pair: its own variable, behind the native gate, after core-publish (skipped is fine).
  assert.match(nativeQuality, /pnpm ci:native/);
  assert.match(nativePublish, /needs: \[native-quality, core-publish\]/);
  assert.match(nativePublish, /vars\.NATIVE_CANARY_PUBLISH_ENABLED == 'true'/);
  assert.match(nativePublish, /needs\.native-quality\.result == 'success'/);
  assert.match(nativePublish, /contains\(fromJSON\('\["success","skipped"\]'\), needs\.core-publish\.result\)/);
  assert.doesNotMatch(nativePublish, /CORE_CANARY_PUBLISH_ENABLED/);
  assert.match(nativePublish, /bash scripts\/publish-canary\.sh pair\n/);
  // The pair is OIDC-only too: it is handed no secret at all.
  assert.doesNotMatch(nativePublish, /NPM_DIST_TAG_TOKEN|secrets\.|\n\s+env:\n/);
  assert.doesNotMatch(job(workflow, "core-publish"), /secrets\.|\n\s+env:\n/);
  // Only the publish jobs get the OIDC token and the environment.
  for (const block of [coreQuality, nativeQuality]) assert.doesNotMatch(block, /id-token|environment:|NPM_DIST_TAG_TOKEN/);
  for (const block of [corePublish, nativePublish]) {
    assert.match(block, /environment: npm-native-canary\n/);
    assert.match(block, /id-token: write/);
    assert.match(block, /cancel-in-progress: false/);
  }
  // One concurrency group for both publish jobs, so a pair publish cannot race a core publish.
  const group = (block) => block.match(/\n {6}group: (\S+)\n/)?.[1];
  assert.ok(group(corePublish), "core-publish needs a concurrency group");
  assert.equal(group(nativePublish), group(corePublish));
  // A skipped core-publish is tolerated with !cancelled(); always() would also publish a cancelled run.
  assert.match(nativePublish, /if: \$\{\{ !cancelled\(\) && /);
  assert.doesNotMatch(workflow, /always\(\)/);
  // No job leaves the checkout token behind in .git/config.
  for (const block of [coreQuality, corePublish, nativeQuality, nativePublish]) {
    assert.match(block, /uses: actions\/checkout@[0-9a-f]{40} # v\S+\n\s+with:\n\s+persist-credentials: false\n/);
  }
  assertReadOnlyDefault(workflow);
  assert.doesNotMatch(workflow, /workflow_dispatch|pull_request/);
  for (const line of workflow.split("\n").filter((text) => /\buses:/.test(text))) assert.match(line, /@[0-9a-f]{40} # v/, "actions are pinned by SHA");
});
test("the workflow default stays read-only: top-level grants are rejected", () => {
  const workflow = read(".github/workflows/native-canary.yml");
  assert.equal(topLevelPermissions(workflow), "permissions:\n  contents: read");
  const readOnly = "permissions:\n  contents: read\n";
  assert.ok(workflow.includes(`\n${readOnly}`));
  const widened = (extra) => workflow.replace(readOnly, `${readOnly}${extra}`);
  const mutants = {
    "id-token: write": widened("  id-token: write\n"),
    "contents: write": workflow.replace(readOnly, "permissions:\n  contents: write\n"),
    "extra contents: write": widened("  contents: write\n"),
    "packages: write": widened("  packages: write\n"),
    "write-all": workflow.replace(readOnly, "permissions: write-all\n"),
    "no permissions block": workflow.replace(readOnly, ""),
  };
  for (const [name, text] of Object.entries(mutants)) {
    assert.notEqual(text, workflow, `mutant ${name} must change the workflow`);
    assert.throws(() => assertReadOnlyDefault(text), /workflow-level permissions/, name);
  }
  // Job-level blocks and comments are not the workflow default.
  assert.doesNotThrow(() => assertReadOnlyDefault(workflow.replace("jobs:\n", "# permissions:\n#   id-token: write\njobs:\n")));
});
test("supply-chain policy is untouched by the canary paths", () => {
  const policy = read("pnpm-workspace.yaml");
  assert.match(policy, /^minimumReleaseAge: 10080$/m);
  assert.match(policy, /^trustPolicy: no-downgrade$/m);
  assert.match(policy, /^minimumReleaseAgeExclude:\n {2}- "@vllnt\/\*"$/m);
});

test("version_state distinguishes unpublished versions from registry failures", () => {
  const dir = mkdtempSync(join(tmpdir(), "version-state-"));
  const npmStub = join(dir, "npm");
  const run = (stub) => {
    writeFileSync(npmStub, `#!/usr/bin/env bash\n${stub}\n`, { mode: 0o755 });
    return spawnSync("bash", ["-c", `set -euo pipefail\nsource "${script}"\nversion_state "@vllnt/ui-core@0.1.0-canary.1.shaaaaaaaaaaaa"`], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, RUNNER_TEMP: dir },
    });
  };
  const cases = [
    ["echo 0.1.0-canary.1.shaaaaaaaaaaaa", 0, "present"],
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

// publish-canary.sh against a fake registry (scripts/publish-canary.harness.mjs): the real script
// runs end to end, but npm, npx, pnpm and git are fakes, so nothing can reach npm.

test("core canary goes straight to the canary tag over OIDC and leaves latest alone", (t) => {
  const h = harness(t);
  const before = h.registry();
  const result = h.run("core");
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(uploads(result), [[CORE, VERSION, "canary"]]);
  const args = result.publishes[0].args.join(" ");
  assert.match(args, /--provenance/);
  assert.match(args, /--access public/);
  assert.equal(result.registry[CORE].tags.canary, VERSION);
  assert.equal(result.registry[CORE].tags.latest, BOOTSTRAP);
  assert.deepEqual(result.registry[NATIVE], before[NATIVE]);
  assert.deepEqual(distTagCalls(result), []);
  // The pinned npm uploads without the placeholder token setup-node leaves behind.
  const upload = result.calls.find((call) => call.args[0] === "publish");
  assert.deepEqual([upload.viaNpx, upload.configToken, upload.envToken], [true, false, null]);
  assert.doesNotMatch(result.userconfig, /_authToken/);
  assert.match(result.userconfig, /registry=https:\/\/registry\.npmjs\.org/);
});
test("core canary reads ui-core alone", (t) => {
  const result = harness(t, { without: ["ui", "ui-native"] }).run("core");
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(uploads(result), [[CORE, VERSION, "canary"]]);
});
test("core canary stands down when main has moved on", (t) => {
  const result = harness(t).run("core", { mainShas: [OTHER_SHA] });
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(result.publishes, []);
  assert.match(result.output, /superseded/);
});
test("rerunning a core canary neither republishes nor moves the canary tag", (t) => {
  const h = harness(t);
  assert.equal(h.run("core").status, 0);
  const newer = "0.1.0-canary.99.sha999999999999";
  h.seed((registry) => { registry[CORE].versions.push(newer); registry[CORE].tags.canary = newer; });
  const again = h.run("core");
  assert.equal(again.status, 0, again.output);
  assert.deepEqual(again.publishes, []);
  assert.equal(again.registry[CORE].tags.canary, newer);
});
test("core canary waits for npm to finish processing the upload", (t) => {
  const result = harness(t).run("core", { quirks: { visibleAfterPolls: SLOW_NPM_POLLS } });
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(uploads(result), [[CORE, VERSION, "canary"]]);
  assert.ok(versionPolls(result, CORE) >= SLOW_NPM_POLLS, "the version was polled until npm served it");
  assert.deepEqual(result.registry[CORE].tags, { latest: BOOTSTRAP, canary: VERSION });
  // CANARY_POLL_SECONDS=0 keeps the wait instant, so these harness runs stay fast.
  assert.ok(result.sleeps.length >= SLOW_NPM_POLLS && result.sleeps.every((seconds) => seconds === 0), result.sleeps.join(","));
});
test("core canary refuses to create a package that is not on npm yet", (t) => {
  const h = harness(t);
  h.seed((registry) => { delete registry[CORE]; });
  const result = h.run("core");
  assert.notEqual(result.status, 0);
  assert.deepEqual(result.publishes, []);
  assert.match(result.output, /Bootstrap it by hand/);
});
test("registry errors stop a core canary instead of reading as absence", (t) => {
  // `skip` registry calls succeed first: view-tags runs before the upload (skip 0) and after it (skip 1).
  const cases = [
    { command: "view-tags", skip: 0, uploaded: 0 },
    { command: "view-tags", skip: 1, uploaded: 1 },
    { command: "view-version", skip: 0, uploaded: 0 },
  ];
  for (const { command, skip, uploaded } of cases) {
    const label = `${command} after ${skip} successful call(s)`;
    const result = harness(t).run("core", { fail: [{ command, package: CORE, error: "ETIMEDOUT", skip }] });
    assert.notEqual(result.status, 0, label);
    assert.equal(result.publishes.length, uploaded, label);
    // Failing is not enough: a masked error also stops the run (as "not bootstrapped"), so the
    // run must name the registry error and must not blame a missing package.
    assert.match(result.output, /ETIMEDOUT/, label);
    assert.doesNotMatch(result.output, /Bootstrap it by hand/, label);
  }
});
test("a registry 404 on the dist-tags reads as a missing package, any other error does not", (t) => {
  const missing = harness(t).run("core", { fail: [{ command: "view-tags", package: CORE, error: "E404" }] });
  assert.notEqual(missing.status, 0);
  assert.match(missing.output, /Bootstrap it by hand/);
  const broken = harness(t).run("core", { fail: [{ command: "view-tags", package: CORE, error: "E503" }] });
  assert.notEqual(broken.status, 0);
  assert.match(broken.output, /E503/);
  assert.doesNotMatch(broken.output, /Bootstrap it by hand/);
  for (const result of [missing, broken]) assert.deepEqual(result.publishes, []);
});
test("a core upload that moves latest fails the run", (t) => {
  const result = harness(t).run("core", { quirks: { publishMovesLatest: true } });
  assert.notEqual(result.status, 0);
});
test("core guard failures stop the run before npm is touched", (t) => {
  const cases = [
    { env: { GITHUB_REF: "refs/heads/feature" } }, { env: { GITHUB_SHA: "bad" } }, { env: { GITHUB_RUN_NUMBER: "0" } },
    { manifest: (m) => { m.version = "0.2.0"; } }, { manifest: (m) => { m.version = "0.1.0-canary.1"; } },
    { manifest: (m) => { m.name = "@vllnt/other"; } },
  ];
  for (const { env, manifest } of cases) {
    const h = harness(t);
    if (manifest) h.setManifest("ui-core", manifest);
    const result = h.run("core", { env });
    assert.notEqual(result.status, 0, JSON.stringify(env ?? manifest.toString()));
    assert.deepEqual(result.calls, []);
  }
});
test("core canary refuses a tarball without its built dist", (t) => {
  const h = harness(t);
  rmSync(join(h.root, "packages/ui-core/dist"), { recursive: true });
  const result = h.run("core");
  assert.notEqual(result.status, 0);
  assert.deepEqual(result.publishes, []);
});

// The pair publishes over OIDC only, straight to `canary`, core first. Both packages are checked at
// the end. If the native upload fails after core went up, the run fails and core@canary is briefly
// ahead of native@canary: that is acceptable, because the packed ui-native manifest pins the exact
// ui-core version it was built with, so nobody resolves the pair into a mismatch.
test("pair publishes core then native straight to canary over OIDC, with no token and no dist-tag", (t) => {
  const h = harness(t);
  const before = h.registry();
  const result = h.run("pair");
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(uploads(result), [[CORE, VERSION, "canary"], [NATIVE, VERSION, "canary"]]);
  for (const { args } of result.publishes) {
    const flags = args.join(" ");
    assert.match(flags, /--tag canary/);
    assert.match(flags, /--provenance/);
    assert.match(flags, /--access public/);
  }
  assert.equal(result.publishes[1].manifest.dependencies[CORE], VERSION, "native pins the exact core version");
  assert.equal(result.publishes[1].manifest["react-native"], "./dist/index.js");
  for (const name of [CORE, NATIVE]) {
    assert.deepEqual(result.registry[name].tags, { latest: BOOTSTRAP, canary: VERSION }, `${name}: canary moved, latest untouched`);
    assert.deepEqual(result.registry[name].versions, [...before[name].versions, VERSION], name);
  }
  assert.deepEqual(distTagCalls(result), []);
  // Every upload is on the pinned npm, and the placeholder token setup-node leaves behind is gone.
  for (const call of result.calls.filter((entry) => entry.args[0] === "publish")) {
    assert.deepEqual([call.viaNpx, call.configToken, call.envToken], [true, false, null], call.args.join(" "));
  }
  assert.doesNotMatch(result.userconfig, /_authToken/);
});
test("neither path ever runs npm dist-tag or a login, whatever happens", (t) => {
  const sameCommit = harness(t);
  sameCommit.run("core");
  const nativeFails = harness(t);
  // `uploaded` makes each scenario prove it got as far as the uploads, where dist-tag used to run.
  const runs = {
    core: { result: harness(t).run("core"), ok: true, uploaded: 1 },
    pair: { result: harness(t).run("pair"), ok: true, uploaded: 2 },
    "pair after a core canary of the same commit": { result: sameCommit.run("pair"), ok: true, uploaded: 1 },
    "pair when the native upload fails": {
      result: nativeFails.run("pair", { fail: [{ command: "publish", package: NATIVE, error: "E503" }] }), ok: false, uploaded: 1,
    },
    "pair when the core upload fails": {
      result: harness(t).run("pair", { fail: [{ command: "publish", package: CORE, error: "E503" }] }), ok: false, uploaded: 0,
    },
    "pair that moves latest": { result: harness(t).run("pair", { quirks: { publishMovesLatest: true } }), ok: false, uploaded: 2 },
    "pair when main moved on": { result: harness(t).run("pair", { mainShas: [OTHER_SHA] }), ok: true, uploaded: 0 },
  };
  for (const [label, { result, ok, uploaded }] of Object.entries(runs)) {
    assert.equal(result.status === 0, ok, `${label}: ${result.output}`);
    assert.equal(result.publishes.length, uploaded, label);
    assert.deepEqual(distTagCalls(result), [], label);
  }
  // A rerun that recovers from the failed native upload stays OIDC-only too.
  const rerun = nativeFails.run("pair");
  assert.equal(rerun.status, 0, rerun.output);
  assert.deepEqual(distTagCalls(rerun), []);
});
test("pair waits for npm to serve core before it uploads native, and native before it finishes", (t) => {
  const result = harness(t).run("pair", { quirks: { visibleAfterPolls: SLOW_NPM_POLLS } });
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(uploads(result), [[CORE, VERSION, "canary"], [NATIVE, VERSION, "canary"]]);
  const [coreUpload, nativeUpload] = result.calls.flatMap((call, index) => (call.args[0] === "publish" ? [index] : []));
  const polls = (name, from, to) => result.calls.slice(from, to).filter((call) => call.args[0] === "view" && call.args[1] === `${name}@${VERSION}`).length;
  assert.ok(polls(CORE, coreUpload, nativeUpload) >= SLOW_NPM_POLLS, "core polled until npm served it, before native went up");
  assert.ok(polls(NATIVE, nativeUpload) >= SLOW_NPM_POLLS, "native polled until npm served it");
  for (const name of [CORE, NATIVE]) assert.deepEqual(result.registry[name].tags, { latest: BOOTSTRAP, canary: VERSION }, name);
});
test("pair keeps working after a core canary of the same commit", (t) => {
  const h = harness(t);
  assert.equal(h.run("core").status, 0);
  const result = h.run("pair");
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(uploads(result), [[NATIVE, VERSION, "canary"]], "the core version already on npm is reused");
  assert.equal(result.publishes[0].manifest.dependencies[CORE], VERSION);
  for (const name of [CORE, NATIVE]) assert.deepEqual(result.registry[name].tags, { latest: BOOTSTRAP, canary: VERSION });
});
test("pair keeps working after core canaries of earlier commits", (t) => {
  const h = harness(t);
  const coreOnly = "0.1.0-canary.7.sha111111111111";
  const earlierPair = "0.1.0-canary.5.sha000000000000";
  h.seed((registry) => {
    registry[CORE].versions.push(earlierPair, coreOnly);
    registry[CORE].tags.canary = coreOnly; // core moved on by itself since the last pair
    registry[NATIVE].versions.push(earlierPair);
    registry[NATIVE].tags.canary = earlierPair;
  });
  const result = h.run("pair");
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(uploads(result), [[CORE, VERSION, "canary"], [NATIVE, VERSION, "canary"]]);
  assert.equal(result.publishes[1].manifest.dependencies[CORE], VERSION);
  for (const name of [CORE, NATIVE]) assert.equal(result.registry[name].tags.canary, VERSION);
});
test("a native upload that fails after core fails the run: core canary is set, native is untouched", (t) => {
  const h = harness(t);
  const result = h.run("pair", { fail: [{ command: "publish", package: NATIVE, error: "E503" }] });
  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, /E503/);
  assert.deepEqual(uploads(result), [[CORE, VERSION, "canary"]], "only core went up; the failed native upload is not recorded");
  // core@canary is briefly ahead of native@canary. Accepted: the ui-native manifest pins its exact
  // ui-core version, and there is no dist-tag token to roll it back with.
  assert.deepEqual(result.registry[CORE].tags, { latest: BOOTSTRAP, canary: VERSION });
  assert.ok(result.registry[CORE].versions.includes(VERSION), "the core upload stays: versions are immutable");
  assert.deepEqual(result.registry[NATIVE], { versions: [BOOTSTRAP], tags: { latest: BOOTSTRAP } });
  assert.deepEqual(distTagCalls(result), [], "nothing is rolled back through dist-tag");
  // The next run catches native up and reuses the core version already on npm.
  const rerun = h.run("pair");
  assert.equal(rerun.status, 0, rerun.output);
  assert.deepEqual(uploads(rerun), [[NATIVE, VERSION, "canary"]]);
  for (const name of [CORE, NATIVE]) assert.deepEqual(rerun.registry[name].tags, { latest: BOOTSTRAP, canary: VERSION });
});
test("a core upload that fails stops the pair before native goes up", (t) => {
  const result = harness(t).run("pair", { fail: [{ command: "publish", package: CORE, error: "E503" }] });
  assert.notEqual(result.status, 0);
  assert.match(result.output, /E503/, "it failed on the upload, not earlier");
  assert.deepEqual(result.publishes, []);
  for (const name of [CORE, NATIVE]) assert.deepEqual(result.registry[name].tags, { latest: BOOTSTRAP }, name);
});
test("pair checks latest and canary on both packages and fails loudly", (t) => {
  // An upload that also takes `latest` on either package, or one whose canary tag does not land.
  const cases = [
    { quirks: { publishMovesLatest: CORE }, message: new RegExp(`${CORE} dist-tag latest moved from ${BOOTSTRAP}`) },
    { quirks: { publishMovesLatest: NATIVE }, message: new RegExp(`${NATIVE} dist-tag latest moved from ${BOOTSTRAP}`) },
    { quirks: { publishSkipsTag: CORE }, message: new RegExp(`${CORE} dist-tag canary is '', expected `) },
    { quirks: { publishSkipsTag: NATIVE }, message: new RegExp(`${NATIVE} dist-tag canary is '', expected `) },
  ];
  for (const { quirks, message } of cases) {
    const result = harness(t).run("pair", { quirks });
    assert.notEqual(result.status, 0, JSON.stringify(quirks));
    assert.match(result.output, message, JSON.stringify(quirks));
    assert.match(result.output, /::error::/);
  }
});
test("pair stands down without publishing when main has moved on", (t) => {
  const h = harness(t);
  const before = h.registry();
  const result = h.run("pair", { mainShas: [OTHER_SHA] });
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /superseded/);
  assert.deepEqual(result.publishes, []);
  assert.deepEqual(result.registry, before);
  assert.deepEqual(result.calls.filter((call) => call.tool !== "git"), [], "npm is never reached");
});
test("pair that has started uploading finishes both packages even if main advances meanwhile", (t) => {
  // Stopping between the two uploads would leave core ahead of native and still exit 0. The run
  // that superseded this one is queued behind it in the same concurrency group and publishes next.
  const result = harness(t).run("pair", { mainShas: [SHA, OTHER_SHA] });
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(uploads(result), [[CORE, VERSION, "canary"], [NATIVE, VERSION, "canary"]]);
  for (const name of [CORE, NATIVE]) assert.equal(result.registry[name].tags.canary, VERSION);
});
test("pair needs the guard before it touches npm, and no token", (t) => {
  const offMain = harness(t).run("pair", { env: { GITHUB_REF: "refs/heads/feature" } });
  assert.notEqual(offMain.status, 0);
  assert.deepEqual(offMain.calls, []);
  assert.deepEqual(offMain.publishes, []);
});
test("pair refuses to create packages that are not on npm yet", (t) => {
  const h = harness(t);
  h.seed((registry) => { delete registry[NATIVE]; });
  const result = h.run("pair");
  assert.notEqual(result.status, 0);
  assert.deepEqual(result.publishes, []);
  assert.match(result.output, /Bootstrap it by hand/);
});
test("the registry wait backs off: first CANARY_POLL_SECONDS, doubling, capped, restarting for each package", (t) => {
  const core = harness(t).run("core", { quirks: { visibleAfterPolls: 8 }, env: DEFAULT_WAIT });
  assert.equal(core.status, 0, core.output);
  assert.deepEqual(core.sleeps, BACKOFF, "5 s, doubling, capped at 30 s");
  const pair = harness(t).run("pair", { quirks: { visibleAfterPolls: 8 }, env: DEFAULT_WAIT });
  assert.equal(pair.status, 0, pair.output);
  assert.deepEqual(pair.sleeps, [...BACKOFF, ...BACKOFF], "each package gets its own schedule");
  const tuned = harness(t).run("core", {
    quirks: { visibleAfterPolls: 5 }, env: { CANARY_POLL_SECONDS: "2", CANARY_POLL_MAX_SECONDS: "7" },
  });
  assert.equal(tuned.status, 0, tuned.output);
  assert.deepEqual(tuned.sleeps, [2, 4, 7, 7, 7]);
  const visible = harness(t).run("core", { env: DEFAULT_WAIT });
  assert.deepEqual(visible.sleeps, [], "an upload npm serves at once costs no wait");
});
test("the registry wait has a deadline: a version npm never serves fails the run and names what it waited for", (t) => {
  // The fake sleep returns at once, so a short deadline is reached by polling alone.
  const never = (timeout) => ({
    quirks: { visibleAfterPolls: 1_000_000 }, env: { CANARY_POLL_SECONDS: "10", CANARY_POLL_TIMEOUT_SECONDS: timeout },
  });
  const core = harness(t).run("core", never("3"));
  assert.notEqual(core.status, 0, core.output);
  assert.ok(core.output.includes(`::error::${CORE}@${VERSION} was not visible on npm after `), core.output);
  assert.match(core.output, /after \d+s \(limit 3s\)/);
  assert.deepEqual(core.registry[CORE].tags.latest, BOOTSTRAP);
  // The first delay is 10 s, yet no sleep outlasts the 3 s deadline.
  assert.ok(core.sleeps.length > 0 && core.sleeps.every((seconds) => seconds <= 3), `sleeps: ${core.sleeps}`);
  // In the pair, a core that npm never serves stops the run before native goes up.
  const pair = harness(t).run("pair", never("1"));
  assert.notEqual(pair.status, 0, pair.output);
  assert.ok(pair.output.includes(`${CORE}@${VERSION} was not visible on npm`), pair.output);
  assert.deepEqual(uploads(pair), [[CORE, VERSION, "canary"]]);
  assert.deepEqual(pair.registry[NATIVE].tags, { latest: BOOTSTRAP });
  assert.deepEqual(distTagCalls(pair), []);
});
test("an unknown publish mode is refused", (t) => {
  const result = harness(t).run("latest");
  assert.equal(result.status, 2);
  assert.deepEqual(result.calls, []);
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
    copyFileSync(guard, join(dir, "scripts/release-guard.mjs"));
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
  assert.doesNotMatch(workflow, /npm@latest|secrets\.|NPM_DIST_TAG_TOKEN/);
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
