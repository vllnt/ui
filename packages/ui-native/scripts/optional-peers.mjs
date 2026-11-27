/**
 * Optional peers that `src/primitives/glass-peers.ts` loads with a literal
 * `require` inside a `try` block. Metro marks such a call as an optional
 * dependency, so an app that lacks the peer still bundles.
 *
 * esbuild rewrites `require("x")` to `__require("x")` in ESM output, and Metro
 * only collects calls to the global `require`. Left alone, the published build
 * would never bundle the peers and glass would stay off with no error.
 * `restoreOptionalRequires` undoes the rewrite after the build, and
 * `brokenOptionalRequires` is the check that runs on the built and the packed
 * file.
 */
export const OPTIONAL_PEERS = ["expo-blur", "expo-glass-effect"];

/** Built file, relative to the package, that holds the optional requires. */
export const GLASS_PEERS_FILE = "dist/primitives/glass-peers.js";

/** Rewrites each `__require("peer")` call back to `require("peer")`. */
export function restoreOptionalRequires(source) {
  return OPTIONAL_PEERS.reduce(
    (text, peer) =>
      text.replaceAll(`__require("${peer}")`, `require("${peer}")`),
    source,
  );
}

/**
 * Lists the peers that `source` does not load with a plain `require("peer")`,
 * or that it still loads through the `__require` shim.
 */
export function brokenOptionalRequires(source) {
  return OPTIONAL_PEERS.filter(
    (peer) =>
      !new RegExp(`(?<![\\w$])require\\("${peer}"\\)`).test(source) ||
      source.includes(`__require("${peer}")`),
  );
}
