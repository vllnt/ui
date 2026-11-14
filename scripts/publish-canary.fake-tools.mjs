// Fake npm, npx, pnpm and git for scripts/publish-canary.test.mjs.
//
// One file-backed registry (FAKE_STATE) that records every mutating call, so the tests can run
// scripts/publish-canary.sh end to end without a network, a token or a real publish.
//
//   FAKE_STATE                         registry state: { packages, log, publishes, manifests }
//   FAKE_MAIN_SHA                      what `git ls-remote origin refs/heads/main` reports
//   FAKE_MAIN_ADVANCE_AFTER_PUBLISHES  after N publishes, main reports a different commit
//   FAKE_PACK_NO_DIST                  `pnpm pack` leaves dist/index.js out of the tarball
//   FAKE_FAIL                          JSON [{ kind, name?, once? }] of injected failures; kinds:
//                                      view-tags, view-version, publish, dist-tag-add, dist-tag-rm
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [tool, ...argv] = process.argv.slice(2);
const statePath = process.env.FAKE_STATE;
const state = JSON.parse(readFileSync(statePath, "utf8"));
const rules = JSON.parse(process.env.FAKE_FAIL ?? "[]");

const save = () => writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
const die = (message, code = 1) => {
  save();
  console.error(message);
  process.exit(code);
};
const record = (cmd, details) => {
  const userconfig = process.env.NPM_CONFIG_USERCONFIG ?? null;
  state.log.push({
    cmd,
    argv,
    ...details,
    auth: {
      nodeAuthToken: process.env.NODE_AUTH_TOKEN ?? null,
      userconfig,
      userconfigText: userconfig && existsSync(userconfig) ? readFileSync(userconfig, "utf8") : null,
    },
  });
};
const injected = (kind, name) => {
  const index = rules.findIndex((rule) => rule.kind === kind && (rule.name === undefined || rule.name === name));
  if (index < 0) return false;
  state.consumed ??= [];
  if (rules[index].once) {
    if (state.consumed.includes(index)) return false;
    state.consumed.push(index);
  }
  return true;
};
const splitSpec = (spec) => ({ name: spec.slice(0, spec.lastIndexOf("@")), version: spec.slice(spec.lastIndexOf("@") + 1) });
const manifestOf = (tarball) => JSON.parse(spawnSync("tar", ["-xOf", tarball, "package/package.json"], { encoding: "utf8" }).stdout);

if (tool === "git") {
  if (argv.join(" ") !== "ls-remote --exit-code origin refs/heads/main") die(`unexpected git ${argv.join(" ")}`, 2);
  const after = process.env.FAKE_MAIN_ADVANCE_AFTER_PUBLISHES;
  const advanced = after !== undefined && state.publishes >= Number(after);
  console.log(`${advanced ? "f".repeat(40) : process.env.FAKE_MAIN_SHA}\trefs/heads/main`);
  process.exit(0);
}

if (tool === "pnpm") {
  const [dirFlag, dir, command, destinationFlag, destination] = argv;
  if (dirFlag !== "--dir" || command !== "pack" || destinationFlag !== "--pack-destination") die(`unexpected pnpm ${argv.join(" ")}`, 2);
  const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const stage = mkdtempSync(join(destination, "stage-"));
  mkdirSync(join(stage, "package/dist"), { recursive: true });
  writeFileSync(join(stage, "package/package.json"), JSON.stringify(manifest));
  if (!process.env.FAKE_PACK_NO_DIST) writeFileSync(join(stage, "package/dist/index.js"), "export {};\n");
  const tarball = join(destination, `${manifest.name.replace(/^@/, "").replace("/", "-")}-${manifest.version}.tgz`);
  const packed = spawnSync("tar", ["-czf", tarball, "-C", stage, "package"], { encoding: "utf8" });
  if (packed.status !== 0) die(packed.stderr, 1);
  console.log(tarball);
  process.exit(0);
}

const registry = (name) => state.packages[name];

if (tool === "npm") {
  const [command, ...args] = argv;
  if (command === "version") {
    const [version, prefixFlag, dir, ...flags] = args;
    if (prefixFlag !== "--prefix" || !flags.includes("--no-git-tag-version") || !flags.includes("--ignore-scripts")) die(`unexpected npm ${argv.join(" ")}`, 2);
    const path = join(dir, "package.json");
    const manifest = JSON.parse(readFileSync(path, "utf8"));
    manifest.version = version;
    writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
    process.exit(0);
  }
  if (command === "view") {
    const [spec, field] = args;
    if (field === "dist-tags") {
      if (injected("view-tags", spec)) die("npm error code E503", 1);
      if (!registry(spec)) die("npm error code E404\nnpm error 404 Not Found", 1);
      console.log(JSON.stringify(registry(spec).tags));
      process.exit(0);
    }
    if (field === "version") {
      const { name, version } = splitSpec(spec);
      if (injected("view-version", name)) die("npm error code E503", 1);
      if (!registry(name)?.versions.includes(version)) die("npm error code E404\nnpm error 404 Not Found", 1);
      console.log(version);
      process.exit(0);
    }
  }
  die(`unexpected npm ${argv.join(" ")}`, 2);
}

if (tool === "npx") {
  if (argv[0] !== "--yes" || argv[1] !== "npm@11.18.0") die(`npx must run the pinned npm: ${argv.join(" ")}`, 2);
  const [command, ...args] = argv.slice(2);
  if (command === "whoami") {
    record(command, {});
    save();
    console.log("fake-user");
    process.exit(0);
  }
  if (command === "publish") {
    const [tarball, ...flags] = args;
    const manifest = manifestOf(tarball);
    record(command, { name: manifest.name, version: manifest.version, tag: flags[flags.indexOf("--tag") + 1], flags });
    if (injected("publish", manifest.name)) die("npm error code E500", 1);
    const entry = (state.packages[manifest.name] ??= { versions: [], tags: {} });
    if (entry.versions.includes(manifest.version)) die("npm error code E403 cannot publish over the previously published version", 1);
    entry.versions.push(manifest.version);
    entry.tags[flags[flags.indexOf("--tag") + 1]] = manifest.version;
    // The registry gives a package's first upload an implicit latest tag.
    entry.tags.latest ??= manifest.version;
    state.manifests[`${manifest.name}@${manifest.version}`] = manifest;
    state.publishes += 1;
    save();
    process.exit(0);
  }
  if (command === "dist-tag") {
    const [action, spec, tag] = args;
    if (action === "add") {
      const { name, version } = splitSpec(spec);
      record("dist-tag-add", { name, version, tag });
      if (injected("dist-tag-add", name)) die("npm error code E500", 1);
      if (!registry(name)?.versions.includes(version)) die("npm error code E404", 1);
      registry(name).tags[tag] = version;
      save();
      process.exit(0);
    }
    if (action === "rm") {
      record("dist-tag-rm", { name: spec, tag });
      if (injected("dist-tag-rm", spec)) die("npm error code E500", 1);
      delete registry(spec)?.tags[tag];
      save();
      process.exit(0);
    }
  }
  die(`unexpected npx ${argv.join(" ")}`, 2);
}

die(`unknown tool ${tool}`, 2);
