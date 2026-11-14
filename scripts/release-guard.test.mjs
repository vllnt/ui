import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { releaseVersion } from "./release-guard.mjs";

const input = { web: "0.4.0", core: "0.1.0", native: "0.1.0", ref: "refs/heads/main", sha: "a".repeat(40), run: "42" };
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("stable rejects newer bases, prereleases and unknown channels", () => {
  for (const web of ["0.5.0", "1.0.0", "0.4.0-canary.1", "0.4.01", "0.2.9"]) {
    assert.throws(() => releaseVersion({ ...input, web, mode: "stable" }));
  }
  for (const mode of ["latest", "release", "next", ""]) assert.throws(() => releaseVersion({ ...input, mode }));
});
test("stable 0.4 release and 0.3 maintenance publish from main only", () => {
  for (const web of ["0.4.0", "0.4.1", "0.3.1"]) {
    assert.equal(releaseVersion({ ...input, web, mode: "stable" }), web);
    for (const mode of ["stable", "web-canary", "native-canary"]) {
      assert.throws(() => releaseVersion({ ...input, web, mode, ref: "refs/heads/other" }));
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
test("core canary shares the native canary series and needs only a valid core base", () => {
  assert.equal(releaseVersion({ ...input, mode: "core-canary" }), releaseVersion({ ...input, mode: "native-canary" }));
  assert.equal(releaseVersion({ ...input, native: "0.9.9", mode: "core-canary" }), "0.1.0-canary.42.shaaaaaaaaaaaaa");
  assert.equal(releaseVersion({ ...input, sha: "0123456789ab" + "c".repeat(28), mode: "core-canary" }), "0.1.0-canary.42.sha0123456789ab");
  for (const changes of [{ core: "0.4.0" }, { core: "0.1.0-canary.1" }, { core: "0.1.1" }, { run: "0" }, { run: "01" }, { run: undefined }, { sha: "bad" }, { sha: "A".repeat(40) }, { ref: "refs/heads/other" }, { ref: "refs/tags/v0.1.0" }]) {
    assert.throws(() => releaseVersion({ ...input, ...changes, mode: "core-canary" }), undefined, JSON.stringify(changes));
  }
  for (const mode of ["core", "core-stable", "pair", "canary"]) assert.throws(() => releaseVersion({ ...input, mode }));
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
  assert.match(web.slice(web.indexOf("  release:")), /environment: npm-release/);
  for (const workflow of [web, native]) assert.match(workflow, /node --test scripts\/release-guard.test.mjs/);
});
test("core and native canaries are variable-gated, canary-only, and core never waits for Expo", () => {
  const native = read(".github/workflows/native-canary.yml");
  const script = read("scripts/publish-canary.sh");
  const job = (id) => native.match(new RegExp(`^  ${id}:\\n[\\s\\S]*?(?=^  \\S|(?![\\s\\S]))`, "m"))?.[0] ?? assert.fail(`job ${id} missing`);
  const commands = (id) => job(id).split("\n").filter((line) => /^\s+(- )?run:/.test(line));
  const [coreQuality, publishCore, quality, pair] = ["core-quality", "publish-core", "quality", "publish"].map(job);

  // Each path has its own off-by-default switch.
  assert.match(publishCore, /if: \$\{\{ vars\.CORE_CANARY_PUBLISH == 'true' \}\}/);
  assert.match(pair, /vars\.NATIVE_CANARY_PUBLISH == 'true'/);
  assert.doesNotMatch(native, /if: \$\{\{ false \}\}/);
  // ui-core's canary needs only core's own gate; nothing on its path mentions native or Expo.
  assert.match(publishCore, /^    needs: core-quality$/m);
  for (const command of [...commands("core-quality"), ...commands("publish-core")]) assert.doesNotMatch(command, /ci:native|native|expo/i);
  assert.match(coreQuality, /pnpm -F @vllnt\/ui-core lint[\s\S]*typecheck[\s\S]*build[\s\S]*test:once[\s\S]*pack:check/);
  // The pair stays behind the full native gate and goes after the core job.
  assert.match(quality, /pnpm ci:native/);
  assert.match(pair, /^    needs: \[quality, publish-core\]$/m);
  assert.match(pair, /needs\.quality\.result == 'success'/);
  assert.match(pair, /needs\.publish-core\.result/);
  // Publication happens only through the shared script, in the protected environment, with OIDC.
  assert.match(publishCore, /bash scripts\/publish-canary\.sh core$/m);
  assert.match(pair, /bash scripts\/publish-canary\.sh pair$/m);
  for (const publish of [publishCore, pair]) {
    assert.match(publish, /environment: npm-native-canary/);
    assert.match(publish, /id-token: write/);
    assert.match(publish, /NPM_DIST_TAG_TOKEN: \$\{\{ secrets\.NPM_DIST_TAG_TOKEN \}\}/);
  }
  for (const gate of [coreQuality, quality]) assert.doesNotMatch(gate, /id-token|environment:|secrets\./);
  assert.doesNotMatch(native, /--tag latest|workflow_dispatch|pull_request|scripts\/native-canary/);
  assert.match(native, /branches: \[main\]/);

  // The script: guard first, modes bound to guard channels, staging then canary, never latest.
  assert.match(script, /^  core\) GUARD_MODE="core-canary" ;;$/m);
  assert.match(script, /^    GUARD_MODE="native-canary"$/m);
  assert.ok(script.indexOf('release-guard.mjs "$GUARD_MODE"') < script.indexOf("whoami"));
  assert.match(script, /publish "\$\{TARBALLS\[i\]\}" --tag "\$STAGING_TAG" --provenance --access public/);
  assert.match(script, /dist-tag add "\$\{NAMES\[i\]\}@\$\{CANARY_VERSION\}" canary/);
  assert.doesNotMatch(script, /--tag "?latest|dist-tag (add|rm) [^\n]* "?latest\b/);
});
