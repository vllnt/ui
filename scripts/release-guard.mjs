import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

/** Native publication remains locked to the initial canary series. */
export function assertNativeCanary(version) {
  if (!/^0\.1\.0-canary\.[1-9]\d*\.sha[a-f0-9]{12}$/.test(version ?? "")) {
    throw new Error("Expected 0.1.0-canary.<positive run>.sha<12 lowercase hex>; no stable or custom channel");
  }
  return version;
}

/**
 * Web 0.3.x and 0.4.x may publish stable; newer bases need a separately reviewed change.
 * Stable publishes only from its own `v<version>` tag push; every other mode only from main.
 * That the tagged commit is on main needs git history, so the workflow checks it.
 */
export function releaseVersion({ mode, web, core, native, ref, sha, run }) {
  if (mode === "stable") {
    if (ref !== `refs/tags/v${web}`) throw new Error(`Stable publication requires tag v${web}`);
  } else if (ref !== "refs/heads/main") throw new Error("Publication requires main");
  if (!/^0\.(?:3|4)\.(?:0|[1-9]\d*)$/.test(web)) throw new Error("Unsupported Web release base");
  if (mode === "stable") return web;
  if (!/^[a-f0-9]{40}$/.test(sha ?? "")) throw new Error("Invalid commit SHA");
  if (mode === "web-canary") return `${web}-canary.sha${sha.slice(0, 7)}`;
  if (mode !== "native-canary") throw new Error("Unsupported release channel");
  if (core !== "0.1.0" || native !== core) throw new Error("Core/Native must share the 0.1.0 base");
  if (!/^[1-9]\d*$/.test(run ?? "")) throw new Error("Invalid canary run number");
  return assertNativeCanary(`${core}-canary.${run}.sha${sha.slice(0, 12)}`);
}

const PACKAGES = { "ui-core": "@vllnt/ui-core", "ui-native": "@vllnt/ui-native" };

/**
 * Core and Native publish stable from their own `<dir>-v<X.Y.Z>` tag push, never from a `v*` tag
 * (those belong to Web). The version must be stable semver and equal that package's version;
 * the tagged commit must be on main (`onMain`, from git history) and the package CHANGELOG must
 * have a `## [X.Y.Z]` section. Callers pass `versions` and `changelogs` keyed by package directory.
 */
export function packageRelease({ ref, versions, changelogs, onMain }) {
  const match = /^refs\/tags\/(ui-core|ui-native)-v([^/]+)$/.exec(ref ?? "");
  if (!match) throw new Error("Package publication requires a ui-core-v<X.Y.Z> or ui-native-v<X.Y.Z> tag");
  const [, dir, version] = match;
  if (!/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(version)) throw new Error(`Tag version ${version} is not stable X.Y.Z`);
  if (versions[dir] !== version) throw new Error(`Tag version ${version} does not match packages/${dir} version ${versions[dir]}`);
  if (onMain !== true) throw new Error("Tagged commit is not on origin/main");
  if (!changelogs[dir].split("\n").some((line) => line.startsWith(`## [${version}]`))) {
    throw new Error(`packages/${dir}/CHANGELOG.md has no ## [${version}] section`);
  }
  return { dir, name: PACKAGES[dir], version };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const version = (name) => JSON.parse(read(`packages/${name}/package.json`)).version;
  try {
    if (process.argv.length !== 3) throw new Error("Expected one release mode; no overrides supported");
    if (process.argv[2] === "package-release") {
      const { GITHUB_REF: ref, GITHUB_SHA: sha } = process.env;
      if (!/^[a-f0-9]{40}$/.test(sha ?? "")) throw new Error("Invalid commit SHA");
      const git = spawnSync("git", ["merge-base", "--is-ancestor", sha, "origin/main"], { cwd: root });
      const dirs = Object.keys(PACKAGES);
      const { dir, name, version: tagged } = packageRelease({
        ref,
        versions: Object.fromEntries(dirs.map((d) => [d, version(d)])),
        changelogs: Object.fromEntries(dirs.map((d) => [d, read(`packages/${d}/CHANGELOG.md`)])),
        onMain: git.status === 0,
      });
      // GITHUB_OUTPUT lines for the workflow.
      console.log(`name=${name}\ndir=packages/${dir}\nversion=${tagged}`);
    } else {
      console.log(releaseVersion({
        mode: process.argv[2], web: version("ui"), core: version("ui-core"), native: version("ui-native"),
        ref: process.env.GITHUB_REF, sha: process.env.GITHUB_SHA, run: process.env.GITHUB_RUN_NUMBER,
      }));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
