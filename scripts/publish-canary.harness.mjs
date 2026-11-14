// Test harness for scripts/publish-canary.sh: a throw-away repository root, an in-memory npm
// registry and fake `npm`, `npx`, `pnpm` and `git` on PATH. Nothing here talks to a network, and
// nothing can publish. The real script, `jq`, `tar` and `node` run unmodified.
//
// This file is also the fake tool: the shims in <root>/bin call `node publish-canary.harness.mjs
// --fake <tool> <args>`.
import { spawnSync } from "node:child_process";
import {
  chmodSync, copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const self = fileURLToPath(import.meta.url);
const scripts = dirname(self);

export const SHA = "a".repeat(40);
export const OTHER_SHA = "b".repeat(40);
export const VERSION = `0.1.0-canary.42.sha${SHA.slice(0, 12)}`; // run 42 at SHA
export const BOOTSTRAP = "0.1.0-canary.20260917105553.sha7466647a4ba5";
export const CORE = "@vllnt/ui-core";
export const NATIVE = "@vllnt/ui-native";
const DIST_TAG_TOKEN = "fake-dist-tag-token";

// ---------------------------------------------------------------- fake tools (child process)

function runFake(tool, args) {
  const statePath = process.env.FAKE_STATE;
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  const save = () => writeFileSync(statePath, JSON.stringify(state, null, 2));
  const userconfig = process.env.NPM_CONFIG_USERCONFIG;
  const configText = userconfig && existsSync(userconfig) ? readFileSync(userconfig, "utf8") : "";
  const call = {
    tool, args, viaNpx: process.env.FAKE_VIA_NPX === "1",
    configToken: /_authToken/.test(configText), envToken: process.env.NODE_AUTH_TOKEN ?? null,
    // Whether the dist-tag secret is readable by this process: under its own name, or under any name.
    distTokenByName: "NPM_DIST_TAG_TOKEN" in process.env,
    distTokenByValue: Object.values(process.env).includes(DIST_TAG_TOKEN),
  };
  state.calls.push(call);
  const fail = (code) => { process.stderr.write(`npm error code ${code}\n`); save(); process.exit(1); };
  const injected = (command, name) => {
    for (const rule of state.failures) {
      if (rule.command !== command || (rule.package && rule.package !== name)) continue;
      if (rule.skip > 0) { rule.skip -= 1; continue; }
      if (rule.times > 0) { rule.times -= 1; fail(rule.error); }
    }
  };
  const registry = (name) => state.registry[name];
  const splitSpec = (spec) => {
    const at = spec.lastIndexOf("@");
    return at > 0 ? [spec.slice(0, at), spec.slice(at + 1)] : [spec, ""];
  };

  if (tool === "git") {
    const shas = (process.env.FAKE_MAIN_SHAS ?? SHA).split(",");
    const sha = shas[Math.min(state.gitCalls, shas.length - 1)];
    state.gitCalls += 1;
    save();
    process.stdout.write(`${sha}\trefs/heads/main\n`);
    return;
  }

  if (tool === "pnpm") {
    const dir = args[args.indexOf("--dir") + 1];
    const destination = args[args.indexOf("--pack-destination") + 1];
    const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    // pnpm applies publishConfig overrides; it leaves an exact dependency range alone.
    for (const key of ["main", "module", "types", "exports", "react-native"]) {
      if (manifest.publishConfig?.[key] !== undefined) manifest[key] = manifest.publishConfig[key];
    }
    const staging = mkdtempSync(join(tmpdir(), "fake-pack-"));
    mkdirSync(join(staging, "package"));
    writeFileSync(join(staging, "package/package.json"), JSON.stringify(manifest, null, 2));
    if (existsSync(join(dir, "dist"))) cpSync(join(dir, "dist"), join(staging, "package/dist"), { recursive: true });
    mkdirSync(destination, { recursive: true });
    const tarball = join(resolve(destination), `${manifest.name.replace("@", "").replace("/", "-")}-${manifest.version}.tgz`);
    spawnSync("tar", ["-czf", tarball, "-C", staging, "package"], { stdio: "inherit" });
    rmSync(staging, { recursive: true, force: true });
    save();
    process.stdout.write(`${tarball}\n`);
    return;
  }

  if (tool === "npx") {
    // The pinned npm must be named exactly, as the workflows do.
    if (args[0] !== "--yes" || args[1] !== "npm@11.18.0") { save(); process.stderr.write("fake npx: npm must be pinned\n"); process.exit(97); }
    state.calls.pop();
    save();
    runFake("npm", args.slice(2));
    return;
  }

  const [command, ...rest] = args;
  const dtAuthorised = call.configToken && call.envToken === DIST_TAG_TOKEN;
  if (command === "version") {
    const prefix = rest[rest.indexOf("--prefix") + 1];
    const file = join(resolve(prefix), "package.json");
    const manifest = JSON.parse(readFileSync(file, "utf8"));
    manifest.version = rest[0];
    writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
    save();
    process.stdout.write(`v${rest[0]}\n`);
  } else if (command === "whoami") {
    injected("whoami");
    if (!dtAuthorised) fail("E401");
    save();
    process.stdout.write("tester\n");
  } else if (command === "view" && rest.includes("dist-tags")) {
    injected("view-tags", rest[0]);
    if (!registry(rest[0])) fail("E404");
    save();
    process.stdout.write(`${JSON.stringify(registry(rest[0]).tags)}\n`);
  } else if (command === "view") {
    const [name, version] = splitSpec(rest[0]);
    injected("view-version", name);
    if (!registry(name)) fail("E404");
    save();
    if (registry(name).versions.includes(version)) process.stdout.write(`${version}\n`);
  } else if (command === "publish") {
    const manifest = JSON.parse(spawnSync("tar", ["-xOf", rest[0], "package/package.json"], { encoding: "utf8" }).stdout);
    injected("publish", manifest.name);
    // Trusted publishing only works without a token: a placeholder token would be sent instead.
    if (call.configToken || call.envToken) fail("E401");
    const tag = rest[rest.indexOf("--tag") + 1];
    if (!tag || tag.startsWith("--")) fail("EPRERELEASENOTAG");
    const entry = (state.registry[manifest.name] ??= { versions: [], tags: {} });
    if (entry.versions.includes(manifest.version)) fail("E403");
    entry.versions.push(manifest.version);
    entry.tags[tag] = manifest.version;
    if (!entry.tags.latest) entry.tags.latest = manifest.version; // implicit latest on a first upload
    if (state.quirks.publishMovesLatest) entry.tags.latest = manifest.version;
    state.publishes.push({ name: manifest.name, version: manifest.version, tag, args: rest, manifest });
    save();
  } else if (command === "dist-tag" && rest[0] === "add") {
    const [name, version] = splitSpec(rest[1]);
    injected("dist-tag-add", name);
    if (!dtAuthorised) fail("E401");
    if (!registry(name)?.versions.includes(version)) fail("E404");
    registry(name).tags[rest[2]] = version;
    save();
  } else if (command === "dist-tag" && rest[0] === "rm") {
    injected("dist-tag-rm", rest[1]);
    if (!dtAuthorised) fail("E401");
    delete registry(rest[1])?.tags[rest[2]];
    save();
  } else {
    save();
    process.stderr.write(`fake npm: unsupported command ${args.join(" ")}\n`);
    process.exit(98);
  }
}

if (process.argv[2] === "--fake") runFake(process.argv[3], process.argv.slice(4));

// ---------------------------------------------------------------- harness (test process)

const manifests = {
  ui: { name: "@vllnt/ui", version: "0.4.0" },
  "ui-core": { name: CORE, version: "0.1.0", main: "./src/index.ts", publishConfig: { main: "./dist/index.js", tag: "canary" } },
  "ui-native": {
    name: NATIVE, version: "0.1.0", main: "./src/index.ts", "react-native": "./dist/index.js",
    dependencies: { [CORE]: "workspace:*" }, publishConfig: { main: "./dist/index.js", tag: "canary" },
  },
};

/** `without` names fixture packages to leave out, to prove a path never reads them. */
export function createHarness({ without = [] } = {}) {
  const root = mkdtempSync(join(tmpdir(), "publish-canary-"));
  mkdirSync(join(root, "scripts"));
  copyFileSync(join(scripts, "release-guard.mjs"), join(root, "scripts/release-guard.mjs"));
  for (const [dir, manifest] of Object.entries(manifests)) {
    if (without.includes(dir)) continue;
    mkdirSync(join(root, "packages", dir, "dist"), { recursive: true });
    writeFileSync(join(root, "packages", dir, "package.json"), JSON.stringify(manifest, null, 2));
    writeFileSync(join(root, "packages", dir, "dist/index.js"), "export {};\n");
  }
  mkdirSync(join(root, "bin"));
  for (const tool of ["npm", "npx", "pnpm", "git"]) {
    const via = tool === "npx" ? "FAKE_VIA_NPX=1 " : "";
    writeFileSync(join(root, "bin", tool), `#!/bin/sh\nexec env ${via}node "${self}" --fake ${tool} "$@"\n`);
    chmodSync(join(root, "bin", tool), 0o755);
  }
  const statePath = join(root, "state.json");
  const state = {
    registry: {
      [CORE]: { versions: [BOOTSTRAP], tags: { latest: BOOTSTRAP } },
      [NATIVE]: { versions: [BOOTSTRAP], tags: { latest: BOOTSTRAP } },
    },
    calls: [], publishes: [], failures: [], quirks: {}, gitCalls: 0,
  };
  const read = () => JSON.parse(readFileSync(statePath, "utf8"));
  const write = (next) => writeFileSync(statePath, JSON.stringify(next, null, 2));
  write(state);
  const manifestEdits = [];
  // The script bumps versions in the working tree, so every run starts from a fresh checkout.
  const resetManifests = () => {
    for (const [dir, base] of Object.entries(manifests)) {
      if (without.includes(dir)) continue;
      const manifest = structuredClone(base);
      for (const edit of manifestEdits) if (edit.dir === dir) edit.apply(manifest);
      writeFileSync(join(root, "packages", dir, "package.json"), JSON.stringify(manifest, null, 2));
    }
  };

  return {
    root,
    registry: () => read().registry,
    /** Edits the fake registry before a run. */
    seed(edit) { const next = read(); edit(next.registry); write(next); },
    /** Edits a fixture package manifest for every later run. */
    setManifest(dir, apply) { manifestEdits.push({ dir, apply }); },
    /** Runs the script as the workflow does. `fail`: [{command, package?, error, skip?, times?}]. */
    run(mode, { env = {}, mainShas = [SHA], fail = [], quirks = {} } = {}) {
      resetManifests();
      const next = read();
      Object.assign(next, { calls: [], publishes: [], gitCalls: 0, quirks });
      next.failures = fail.map((rule) => ({ skip: 0, times: 1, ...rule }));
      write(next);
      writeFileSync(join(root, "npmrc"), "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}\nregistry=https://registry.npmjs.org/\n");
      mkdirSync(join(root, "runner-temp"), { recursive: true });
      const result = spawnSync("bash", [join(scripts, "publish-canary.sh"), mode], {
        cwd: root, encoding: "utf8",
        env: {
          PATH: `${join(root, "bin")}:${process.env.PATH}`, HOME: root,
          GITHUB_REF: "refs/heads/main", GITHUB_SHA: SHA, GITHUB_RUN_NUMBER: "42", GITHUB_RUN_ID: "9001",
          RUNNER_TEMP: join(root, "runner-temp"), CANARY_POLL_SECONDS: "0",
          NPM_CONFIG_USERCONFIG: join(root, "npmrc"), NODE_AUTH_TOKEN: "XXXXX-XXXXX-XXXXX-XXXXX", // as setup-node leaves them
          NPM_DIST_TAG_TOKEN: DIST_TAG_TOKEN, FAKE_STATE: statePath, FAKE_MAIN_SHAS: mainShas.join(","),
          ...env,
        },
      });
      const after = read();
      return {
        status: result.status, output: `${result.stdout}${result.stderr}`,
        calls: after.calls, publishes: after.publishes, registry: after.registry,
        userconfig: readFileSync(join(root, "npmrc"), "utf8"),
      };
    },
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}
