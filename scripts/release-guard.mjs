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

/** Web 0.4+ stays canary-only until a separately reviewed promotion change. */
export function releaseVersion({ mode, web, core, native, ref, sha, run }) {
  if (ref !== "refs/heads/main") throw new Error("Publication requires main");
  if (!/^0\.(?:3|4)\.(?:0|[1-9]\d*)$/.test(web)) throw new Error("Unsupported Web release base");
  if (mode === "stable") {
    if (!/^0\.3\./.test(web)) throw new Error("0.4.0 release hold: separate reviewed promotion and verification required");
    return web;
  }
  if (!/^[a-f0-9]{40}$/.test(sha ?? "")) throw new Error("Invalid commit SHA");
  if (mode === "web-canary") return `${web}-canary.sha${sha.slice(0, 7)}`;
  if (mode !== "native-canary") throw new Error("Unsupported release channel");
  if (core !== "0.1.0" || native !== core) throw new Error("Core/Native must share the 0.1.0 base");
  if (!/^[1-9]\d*$/.test(run ?? "")) throw new Error("Invalid canary run number");
  return assertNativeCanary(`${core}-canary.${run}.sha${sha.slice(0, 12)}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const version = (name) => JSON.parse(readFileSync(new URL(`../packages/${name}/package.json`, import.meta.url), "utf8")).version;
  try {
    if (process.argv.length !== 3) throw new Error("Expected one release mode; no overrides supported");
    console.log(releaseVersion({
      mode: process.argv[2], web: version("ui"), core: version("ui-core"), native: version("ui-native"),
      ref: process.env.GITHUB_REF, sha: process.env.GITHUB_SHA, run: process.env.GITHUB_RUN_NUMBER,
    }));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
