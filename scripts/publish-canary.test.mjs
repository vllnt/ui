import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

// Runs scripts/publish-canary.sh end to end against a fake npm registry (publish-canary.fake-tools.mjs).
// No network, no token, no real publish.
const here = (name) => fileURLToPath(new URL(name, import.meta.url));
const BOOT = "0.1.0-canary.20260917105553.sha7466647a4ba5";
const PREV = "0.1.0-canary.5.sha000000000000";
const SHA = "0123456789abcdef0123456789abcdef01234567";
const CORE = "@vllnt/ui-core";
const NATIVE = "@vllnt/ui-native";
const versionFor = (run, sha = SHA) => `0.1.0-canary.${run}.sha${sha.slice(0, 12)}`;
const bootstrapped = (...names) => Object.fromEntries(names.map((name) => [name, { versions: [BOOT], tags: { latest: BOOT } }]));
const mutations = (state) => state.log.filter((entry) => entry.cmd !== "whoami");
const published = (state) => state.log.filter((entry) => entry.cmd === "publish");

function withFixture(registry, body) {
  const dir = mkdtempSync(join(tmpdir(), "publish-canary-"));
  const write = (path, content) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  };
  const manifest = (name, extra = {}) => JSON.stringify({ name, version: "0.1.0", main: "./dist/index.js", ...extra });
  // The script rewrites package.json in its checkout; every CI run starts from a fresh one.
  const checkout = () => {
    write("packages/ui/package.json", JSON.stringify({ name: "@vllnt/ui", version: "0.4.0" }));
    write("packages/ui-core/package.json", manifest(CORE));
    write("packages/ui-native/package.json", manifest(NATIVE, { "react-native": "./dist/index.js", dependencies: { [CORE]: "workspace:*" } }));
  };
  try {
    for (const file of ["publish-canary.sh", "release-guard.mjs"]) {
      mkdirSync(join(dir, "scripts"), { recursive: true });
      copyFileSync(here(file), join(dir, "scripts", file));
    }
    write("state.json", JSON.stringify({ packages: registry, log: [], publishes: 0, manifests: {} }));
    mkdirSync(join(dir, "runner-temp"));
    for (const tool of ["npm", "npx", "pnpm", "git"]) {
      write(`bin/${tool}`, `#!/usr/bin/env bash\nexec node "${here("publish-canary.fake-tools.mjs")}" ${tool} "$@"\n`);
      chmodSync(join(dir, "bin", tool), 0o755);
    }
    const state = () => JSON.parse(readFileSync(join(dir, "state.json"), "utf8"));
    const run = (mode, { run = 7, sha = SHA, env = {}, args = [mode] } = {}) => {
      checkout();
      const result = spawnSync("bash", [join(dir, "scripts/publish-canary.sh"), ...args], {
        cwd: dir,
        encoding: "utf8",
        env: {
          PATH: `${join(dir, "bin")}:${process.env.PATH}`,
          HOME: dir,
          GITHUB_REF: "refs/heads/main",
          GITHUB_SHA: sha,
          GITHUB_RUN_ID: String(9000 + run),
          GITHUB_RUN_NUMBER: String(run),
          RUNNER_TEMP: join(dir, "runner-temp"),
          NPM_DIST_TAG_TOKEN: "dist-tag-token",
          FAKE_STATE: join(dir, "state.json"),
          FAKE_MAIN_SHA: sha,
          ...env,
        },
      });
      // ::error:: annotations go to stdout, npm's own errors to stderr.
      const output = result.stdout + result.stderr;
      return { status: result.status, stdout: result.stdout, stderr: result.stderr, output, state: state(), version: versionFor(run, sha) };
    };
    return body({ dir, run, state });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("core mode publishes ui-core only and moves only its canary tag", () => {
  withFixture(bootstrapped(CORE, NATIVE), ({ run }) => {
    const { status, stderr, state, version } = run("core");
    assert.equal(status, 0, stderr);
    assert.equal(version, "0.1.0-canary.7.sha0123456789ab");
    assert.deepEqual(state.packages[CORE].tags, { latest: BOOT, canary: version });
    assert.deepEqual(state.packages[CORE].versions, [BOOT, version]);
    assert.deepEqual(state.packages[NATIVE], { versions: [BOOT], tags: { latest: BOOT } });
    assert.ok(!JSON.stringify(state.log).includes("ui-native"), "core mode must not touch ui-native");
    const [upload] = published(state);
    assert.equal(published(state).length, 1);
    assert.deepEqual(upload.flags, ["--tag", "run-9007", "--provenance", "--access", "public"]);
    assert.ok(mutations(state).every((entry) => !entry.argv.includes("latest")), "no command may name the latest tag");
  });
});

test("pair mode publishes core then native pinned to the exact core version", () => {
  withFixture(bootstrapped(CORE, NATIVE), ({ run }) => {
    const { status, stderr, state, version } = run("pair");
    assert.equal(status, 0, stderr);
    assert.deepEqual(published(state).map((entry) => entry.name), [CORE, NATIVE]);
    for (const name of [CORE, NATIVE]) assert.deepEqual(state.packages[name].tags, { latest: BOOT, canary: version });
    assert.equal(state.manifests[`${NATIVE}@${version}`].dependencies[CORE], version);
    assert.equal(state.manifests[`${CORE}@${version}`].version, version);
    assert.ok(mutations(state).every((entry) => !entry.argv.includes("latest")));
  });
});

test("a pair publish still works after core-only canaries", () => {
  withFixture(bootstrapped(CORE, NATIVE), ({ run }) => {
    const first = run("core", { run: 10 });
    assert.equal(first.status, 0, first.stderr);
    const second = run("pair", { run: 11 });
    assert.equal(second.status, 0, second.stderr);
    const { state, version } = second;
    assert.equal(state.packages[CORE].tags.canary, version);
    assert.equal(state.packages[NATIVE].tags.canary, version);
    assert.deepEqual(state.packages[CORE].versions, [BOOT, versionFor(10), version], "earlier core canaries stay published");
    assert.equal(state.manifests[`${NATIVE}@${version}`].dependencies[CORE], version);
  });
});

test("the pair reuses the core version the core job already published for the same run", () => {
  withFixture(bootstrapped(CORE, NATIVE), ({ run }) => {
    assert.equal(run("core", { run: 12 }).status, 0);
    const { status, stderr, state, version } = run("pair", { run: 12 });
    assert.equal(status, 0, stderr);
    assert.deepEqual(published(state).map((entry) => entry.name), [CORE, NATIVE], "core is uploaded once, by the core job");
    assert.equal(state.packages[NATIVE].tags.canary, version);
    assert.equal(state.manifests[`${NATIVE}@${version}`].dependencies[CORE], version);
    assert.deepEqual(state.packages[CORE].tags, { latest: BOOT, canary: version });
  });
});

test("a rerun after a failed native upload skips the core version already published", () => {
  withFixture(bootstrapped(CORE, NATIVE), ({ run }) => {
    const failed = run("pair", { env: { FAKE_FAIL: JSON.stringify([{ kind: "publish", name: NATIVE, once: true }]) } });
    assert.notEqual(failed.status, 0);
    assert.equal(failed.state.packages[CORE].tags.canary, undefined, "nothing is promoted before both uploads are visible");
    assert.deepEqual(failed.state.packages[CORE].tags, { latest: BOOT });
    const rerun = run("pair");
    assert.equal(rerun.status, 0, rerun.stderr);
    assert.deepEqual(published(rerun.state).map((entry) => entry.name), [CORE, NATIVE, NATIVE]);
    for (const name of [CORE, NATIVE]) assert.deepEqual(rerun.state.packages[name].tags, { latest: BOOT, canary: rerun.version });
  });
});

test("a failed promotion restores the previous canary pair and removes staging tags", () => {
  const registry = Object.fromEntries([CORE, NATIVE].map((name) => [name, { versions: [BOOT, PREV], tags: { latest: BOOT, canary: PREV } }]));
  withFixture(registry, ({ run }) => {
    const env = { FAKE_FAIL: JSON.stringify([{ kind: "dist-tag-add", name: NATIVE, once: true }]) };
    const { status, output, state, version } = run("pair", { env });
    assert.notEqual(status, 0);
    assert.doesNotMatch(output, /Could not fully restore/);
    for (const name of [CORE, NATIVE]) {
      assert.deepEqual(state.packages[name].tags, { latest: BOOT, canary: PREV }, name);
      assert.ok(state.packages[name].versions.includes(version), "published versions are immutable");
    }
  });
});

test("an unpromoted run when main advanced leaves canary alone and cleans up", () => {
  withFixture(bootstrapped(CORE), ({ run }) => {
    const { status, stdout, state, version } = run("core", { env: { FAKE_MAIN_ADVANCE_AFTER_PUBLISHES: "1" } });
    assert.equal(status, 0);
    assert.match(stdout, /Skipping canary promotion/);
    assert.deepEqual(state.packages[CORE].tags, { latest: BOOT });
    assert.ok(state.packages[CORE].versions.includes(version));
  });
});

test("a superseded run publishes nothing", () => {
  withFixture(bootstrapped(CORE, NATIVE), ({ run }) => {
    const { status, stdout, state } = run("pair", { env: { FAKE_MAIN_SHA: "b".repeat(40) } });
    assert.equal(status, 0);
    assert.match(stdout, /Skipping superseded canary run/);
    assert.deepEqual(mutations(state), []);
  });
});

test("never publishes a package an npm owner has not bootstrapped", () => {
  for (const [registry, mode] of [[{}, "core"], [bootstrapped(CORE), "pair"], [{ [CORE]: { versions: [BOOT], tags: {} }, ...bootstrapped(NATIVE) }, "pair"]]) {
    withFixture(registry, ({ run }) => {
      const { status, output, state } = run(mode);
      assert.equal(status, 1, output);
      assert.match(output, /bootstrap/);
      assert.deepEqual(mutations(state), [], "refusal happens before any upload, including core");
    });
  }
});

test("registry errors are never read as absence", () => {
  for (const kind of ["view-tags", "view-version"]) {
    withFixture(bootstrapped(CORE), ({ run }) => {
      const { status, output, state } = run("core", { env: { FAKE_FAIL: JSON.stringify([{ kind }]) } });
      assert.equal(status, 1, kind);
      assert.match(output, /E503|Could not determine/, kind);
      assert.deepEqual(mutations(state), [], kind);
    });
  }
});

test("a missing dist-tag token stops the run before any mutation", () => {
  withFixture(bootstrapped(CORE), ({ run }) => {
    const { status, output, state } = run("core", { env: { NPM_DIST_TAG_TOKEN: "" } });
    assert.equal(status, 1);
    assert.match(output, /NPM_DIST_TAG_TOKEN/);
    assert.deepEqual(state.log, []);
  });
});

test("unknown modes and guard failures reach no registry", () => {
  withFixture(bootstrapped(CORE, NATIVE), ({ run, state }) => {
    for (const args of [[], ["stable"], ["latest"], ["core", "extra"]]) assert.notEqual(run("core", { args }).status, 0, args.join(" "));
    assert.equal(run("core", { env: { GITHUB_REF: "refs/heads/other" } }).status, 1);
    assert.equal(run("core", { env: { GITHUB_REF: "refs/tags/v0.1.0" } }).status, 1);
    assert.deepEqual(state().log, []);
  });
});

test("a tarball without its dist entry is never uploaded", () => {
  withFixture(bootstrapped(CORE), ({ run }) => {
    const { status, state } = run("core", { env: { FAKE_PACK_NO_DIST: "1" } });
    assert.equal(status, 1);
    assert.deepEqual(published(state), []);
  });
});

test("uploads carry no static token and dist-tag commands use only the scoped token", () => {
  withFixture(bootstrapped(CORE), ({ run, dir }) => {
    const npmrc = join(dir, "setup-node.npmrc");
    writeFileSync(npmrc, "registry=https://registry.npmjs.org/\n//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}\n");
    const { status, stderr, state } = run("core", { env: { NPM_CONFIG_USERCONFIG: npmrc, NODE_AUTH_TOKEN: "XXXXX-XXXXX-XXXXX-XXXXX" } });
    assert.equal(status, 0, stderr);
    for (const entry of published(state)) {
      assert.equal(entry.auth.nodeAuthToken, null, "trusted publishing must not see a placeholder token");
      assert.equal(entry.auth.userconfig, npmrc);
      assert.doesNotMatch(entry.auth.userconfigText, /_authToken/);
    }
    const tagCommands = state.log.filter((entry) => entry.cmd !== "publish");
    assert.ok(tagCommands.length >= 3, "whoami, promotion and staging cleanup");
    for (const entry of tagCommands) {
      assert.equal(entry.auth.nodeAuthToken, "dist-tag-token", entry.cmd);
      assert.notEqual(entry.auth.userconfig, npmrc, entry.cmd);
      assert.match(entry.auth.userconfigText, /_authToken=\$\{NODE_AUTH_TOKEN\}/, entry.cmd);
    }
  });
});
