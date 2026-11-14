import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

/** Core/Native publication remains locked to the initial canary series. */
export function assertNativeCanary(version) {
  if (!/^0\.1\.0-canary\.[1-9]\d*\.sha[a-f0-9]{12}$/.test(version ?? "")) {
    throw new Error("Expected 0.1.0-canary.<positive run>.sha<12 lowercase hex>; no stable or custom channel");
  }
  return version;
}

/** Web 0.3.x and 0.4.x may publish stable; newer bases need a separately reviewed change. */
export function releaseVersion({ mode, web, core, native, ref, sha, run }) {
  if (ref !== "refs/heads/main") throw new Error("Publication requires main");
  if (mode === "core-canary") return coreCanaryVersion({ core, sha, run });
  if (!/^0\.(?:3|4)\.(?:0|[1-9]\d*)$/.test(web)) throw new Error("Unsupported Web release base");
  if (mode === "stable") return web;
  if (!/^[a-f0-9]{40}$/.test(sha ?? "")) throw new Error("Invalid commit SHA");
  if (mode === "web-canary") return `${web}-canary.sha${sha.slice(0, 7)}`;
  if (mode !== "native-canary") throw new Error("Unsupported release channel");
  if (core !== "0.1.0" || native !== core) throw new Error("Core/Native must share the 0.1.0 base");
  if (!/^[1-9]\d*$/.test(run ?? "")) throw new Error("Invalid canary run number");
  return assertNativeCanary(`${core}-canary.${run}.sha${sha.slice(0, 12)}`);
}

/**
 * ui-core publishes on its own: only its own base is checked, so neither the Web release
 * base nor the Native base can block it. Same version scheme as the Core/Native pair.
 */
function coreCanaryVersion({ core, sha, run }) {
  if (core !== "0.1.0") throw new Error("Core must be on the 0.1.0 base");
  if (!/^[a-f0-9]{40}$/.test(sha ?? "")) throw new Error("Invalid commit SHA");
  if (!/^[1-9]\d*$/.test(run ?? "")) throw new Error("Invalid canary run number");
  return assertNativeCanary(`${core}-canary.${run}.sha${sha.slice(0, 12)}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const version = (name) => JSON.parse(readFileSync(new URL(`../packages/${name}/package.json`, import.meta.url), "utf8")).version;
  try {
    if (process.argv.length !== 3) throw new Error("Expected one release mode; no overrides supported");
    const mode = process.argv[2];
    // core-canary reads ui-core alone: other manifests must not be able to affect it.
    const bases = mode === "core-canary" ? { core: version("ui-core") }
      : { web: version("ui"), core: version("ui-core"), native: version("ui-native") };
    console.log(releaseVersion({
      mode, ...bases,
      ref: process.env.GITHUB_REF, sha: process.env.GITHUB_SHA, run: process.env.GITHUB_RUN_NUMBER,
    }));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
