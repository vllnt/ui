import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { releaseVersion } from "./release-guard.mjs";

const input = { web: "0.4.0", core: "0.4.0", native: "0.4.0", ref: "refs/heads/main", sha: "a".repeat(40), run: "42" };
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
  assert.equal(releaseVersion({ ...input, mode: "native-canary" }), "0.4.0-canary.42.shaaaaaaaaaaaaa");
  for (const changes of [{ core: "0.1.0" }, { native: "0.4.1" }, { web: "0.3.0" }, { run: "0" }, { sha: "bad" }]) {
    assert.throws(() => releaseVersion({ ...input, ...changes, mode: "native-canary" }));
  }
});
test("checked-in bases, availability and stable install pin remain coherent", () => {
  for (const name of ["ui", "ui-core", "ui-native"]) assert.equal(JSON.parse(read(`packages/${name}/package.json`)).version, "0.4.0");
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
  assert.doesNotMatch(native, /--tag latest|workflow_dispatch/);
  assert.match(native, /dist-tag add "@vllnt\/ui-native@\$\{CANARY_VERSION\}" canary/);
  for (const workflow of [web, native]) assert.match(workflow, /node --test scripts\/release-guard.test.mjs/);
});
