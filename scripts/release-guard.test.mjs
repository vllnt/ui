import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { releaseVersion } from "./release-guard.mjs";
import { BOOTSTRAP, CORE, NATIVE, OTHER_SHA, SHA, VERSION, createHarness } from "./publish-canary.harness.mjs";

const input = { web: "0.4.0", core: "0.1.0", native: "0.1.0", ref: "refs/heads/main", sha: "a".repeat(40), run: "42" };
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
const distTags = (result, verb) => result.calls.filter((call) => call.args[0] === "dist-tag" && call.args[1] === verb);

test("stable rejects newer bases, prereleases and unknown channels", () => {
  for (const web of ["0.5.0", "1.0.0", "0.4.0-canary.1", "0.4.01", "0.2.9"]) {
    assert.throws(() => releaseVersion({ ...input, web, mode: "stable" }));
  }
  for (const mode of ["latest", "release", "next", ""]) assert.throws(() => releaseVersion({ ...input, mode }));
});
test("stable 0.4 release and 0.3 maintenance publish from main only", () => {
  for (const web of ["0.4.0", "0.4.1", "0.3.1"]) {
    assert.equal(releaseVersion({ ...input, web, mode: "stable" }), web);
    for (const mode of ["stable", "web-canary", "native-canary", "core-canary"]) {
      assert.throws(() => releaseVersion({ ...input, web, mode, ref: "refs/heads/other" }));
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
  assert.ok(web.indexOf("release-guard.mjs stable") < web.indexOf("git tag -a"));
  assert.ok(web.indexOf("release-guard.mjs web-canary") < web.indexOf('npm version "$CANARY_VERSION"'));
  assert.match(web, /publish "\$TARBALL" --tag canary/);
  assert.match(web, /publish "\$TARBALL" --tag latest/);
  assert.match(web.slice(web.indexOf("  release:")), /environment: npm-release/);
  assert.ok(publisher.indexOf("release-guard.mjs core-canary") < publisher.indexOf('npm version "$CANARY_VERSION"'));
  assert.ok(publisher.indexOf("release-guard.mjs native-canary") < publisher.indexOf("npm_with_token whoami"));
  assert.ok(publisher.indexOf("npm_with_token whoami") < publisher.indexOf('publish_tarball "$core_tarball"'));
  // Every upload goes to the canary tag (core) or the run-scoped staging tag (pair), never latest.
  const tags = [...publisher.matchAll(/publish_tarball "[^"]+" (\S+)/g)].map((match) => match[1]);
  assert.deepEqual(tags.sort(), ['"$STAGING_TAG"', '"$STAGING_TAG"', "canary"]);
  assert.doesNotMatch(publisher, /--tag latest|dist-tag add [^\n]* latest/);
  assert.match(publisher, /dist-tag add "\$\{NATIVE_NAME\}@\$\{CANARY_VERSION\}" canary/);
  assert.doesNotMatch(native, /--tag latest|workflow_dispatch|scripts\/native-canary|if: \$\{\{ false \}\}/);
  for (const workflow of [web, native]) assert.match(workflow, /node --test scripts\/release-guard.test.mjs/);
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
  // Only the publish jobs get the OIDC token and the environment.
  for (const block of [coreQuality, nativeQuality]) assert.doesNotMatch(block, /id-token|environment:|NPM_DIST_TAG_TOKEN/);
  for (const block of [corePublish, nativePublish]) {
    assert.match(block, /environment: npm-native-canary\n/);
    assert.match(block, /id-token: write/);
    assert.match(block, /cancel-in-progress: false/);
  }
  // One concurrency group for both publish jobs, so a pair promotion cannot race a core publish.
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
  const result = h.run("core", { env: { NPM_DIST_TAG_TOKEN: "" } }); // core needs no dist-tag token
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(uploads(result), [[CORE, VERSION, "canary"]]);
  const args = result.publishes[0].args.join(" ");
  assert.match(args, /--provenance/);
  assert.match(args, /--access public/);
  assert.equal(result.registry[CORE].tags.canary, VERSION);
  assert.equal(result.registry[CORE].tags.latest, BOOTSTRAP);
  assert.deepEqual(result.registry[NATIVE], before[NATIVE]);
  assert.deepEqual(result.calls.filter((call) => ["whoami", "dist-tag"].includes(call.args[0])), []);
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

test("pair stages both packages, pins core exactly and promotes both tags together", (t) => {
  const result = harness(t).run("pair");
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(uploads(result), [[CORE, VERSION, "run-9001"], [NATIVE, VERSION, "run-9001"]]);
  assert.equal(result.publishes[1].manifest.dependencies[CORE], VERSION);
  assert.equal(result.publishes[1].manifest["react-native"], "./dist/index.js");
  for (const name of [CORE, NATIVE]) {
    assert.deepEqual(result.registry[name].tags, { latest: BOOTSTRAP, canary: VERSION }, `${name} tags (staging tag removed)`);
  }
  assert.deepEqual(distTags(result, "add").map((call) => call.args.slice(2)), [[`${CORE}@${VERSION}`, "canary"], [`${NATIVE}@${VERSION}`, "canary"]]);
  // OIDC for uploads, the dist-tag token only for dist-tag commands, everything on the pinned npm.
  for (const call of result.calls.filter((entry) => ["publish", "whoami", "dist-tag"].includes(entry.args[0]))) {
    assert.equal(call.viaNpx, true, call.args.join(" "));
    assert.equal(call.configToken, call.args[0] !== "publish", call.args.join(" "));
    assert.equal(call.envToken, call.args[0] === "publish" ? null : "fake-dist-tag-token", call.args.join(" "));
  }
});
test("the dist-tag token reaches only the dist-tag commands", (t) => {
  const tokenCommands = new Set(["whoami", "dist-tag"]);
  for (const mode of ["core", "pair"]) {
    // The harness exports NPM_DIST_TAG_TOKEN to the script, as the workflow step env does.
    const result = harness(t).run(mode);
    assert.equal(result.status, 0, `${mode}: ${result.output}`);
    for (const call of result.calls) {
      const label = `${mode}: ${call.tool} ${call.args.join(" ")}`;
      assert.equal(call.distTokenByName, false, `${label} must not see NPM_DIST_TAG_TOKEN`);
      assert.equal(call.distTokenByValue, call.tool === "npm" && tokenCommands.has(call.args[0]), label);
    }
  }
  // The pair run did exercise the processes that must stay blind: pack, npx, the OIDC upload, git.
  const pair = harness(t).run("pair");
  const saw = (match) => pair.calls.some(match);
  assert.ok(saw((call) => call.tool === "pnpm" && call.args.includes("pack")), "pnpm pack observed");
  assert.ok(saw((call) => call.tool === "npm" && call.args[0] === "publish" && call.viaNpx), "npx upload observed");
  assert.ok(saw((call) => call.tool === "git"), "git observed");
  assert.ok(saw((call) => call.args[0] === "dist-tag" && call.distTokenByValue), "dist-tag still gets the token");
});
test("pair keeps working after a core canary of the same commit", (t) => {
  const h = harness(t);
  assert.equal(h.run("core").status, 0);
  const result = h.run("pair");
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(uploads(result), [[NATIVE, VERSION, "run-9001"]], "the core version already on npm is reused");
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
  assert.deepEqual(uploads(result), [[CORE, VERSION, "run-9001"], [NATIVE, VERSION, "run-9001"]]);
  assert.equal(result.publishes[1].manifest.dependencies[CORE], VERSION);
  for (const name of [CORE, NATIVE]) assert.equal(result.registry[name].tags.canary, VERSION);
});
test("pair puts the previous canary tags back when promotion fails halfway", (t) => {
  const h = harness(t);
  const previous = "0.1.0-canary.5.sha000000000000";
  h.seed((registry) => {
    for (const name of [CORE, NATIVE]) { registry[name].versions.push(previous); registry[name].tags.canary = previous; }
  });
  const result = h.run("pair", { fail: [{ command: "dist-tag-add", package: NATIVE, error: "E503" }] });
  assert.notEqual(result.status, 0);
  for (const name of [CORE, NATIVE]) {
    assert.deepEqual(result.registry[name].tags, { latest: BOOTSTRAP, canary: previous }, name);
    assert.ok(result.registry[name].versions.includes(VERSION), "uploaded versions stay: they are immutable");
  }
});
test("pair leaves canary untouched and clears staging when the native upload fails", (t) => {
  const result = harness(t).run("pair", { fail: [{ command: "publish", package: NATIVE, error: "E503" }] });
  assert.notEqual(result.status, 0);
  assert.deepEqual(result.registry[CORE].tags, { latest: BOOTSTRAP });
  assert.deepEqual(result.registry[NATIVE].tags, { latest: BOOTSTRAP });
  assert.deepEqual(distTags(result, "add"), []);
});
test("pair fails when staging cleanup cannot read the registry instead of assuming the tag is gone", (t) => {
  // view-tags for core: before (1st), after promotion (2nd), then the staging cleanup (3rd).
  const result = harness(t).run("pair", { fail: [{ command: "view-tags", package: CORE, error: "ETIMEDOUT", skip: 2 }] });
  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, /Could not fully restore npm dist-tags/);
  assert.equal(result.registry[CORE].tags["run-9001"], VERSION, "the unread staging tag is left for a person to see");
  for (const name of [CORE, NATIVE]) assert.equal(result.registry[name].tags.canary, VERSION, "promotion itself had succeeded");
});
test("pair stands down without promoting when main advances during the upload", (t) => {
  const result = harness(t).run("pair", { mainShas: [SHA, OTHER_SHA] });
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /main advanced/);
  assert.deepEqual(distTags(result, "add"), []);
  for (const name of [CORE, NATIVE]) assert.deepEqual(result.registry[name].tags, { latest: BOOTSTRAP });
});
test("pair needs the dist-tag token and the guard before it touches npm", (t) => {
  const noToken = harness(t).run("pair", { env: { NPM_DIST_TAG_TOKEN: "" } });
  assert.notEqual(noToken.status, 0);
  assert.match(noToken.output, /NPM_DIST_TAG_TOKEN is required/);
  const offMain = harness(t).run("pair", { env: { GITHUB_REF: "refs/heads/feature" } });
  assert.notEqual(offMain.status, 0);
  for (const result of [noToken, offMain]) {
    assert.deepEqual(result.calls, []);
    assert.deepEqual(result.publishes, []);
  }
});
test("pair refuses to create packages that are not on npm yet", (t) => {
  const h = harness(t);
  h.seed((registry) => { delete registry[NATIVE]; });
  const result = h.run("pair");
  assert.notEqual(result.status, 0);
  assert.deepEqual(result.publishes, []);
});
test("an unknown publish mode is refused", (t) => {
  const result = harness(t).run("latest");
  assert.equal(result.status, 2);
  assert.deepEqual(result.calls, []);
});
