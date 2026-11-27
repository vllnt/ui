import {
  type GlassPeerExports,
  type GlassRenderer,
  resolveGlassRenderer,
} from "./glass-renderer";

/**
 * Each optional peer loads with a literal `require` in a `try` block at module
 * scope. Metro flags such a call as an optional dependency (Expo enables
 * `allowOptionalDependencies`), so an app without the peer still bundles, and
 * the `catch` absorbs the failed `require`. Keep every one a plain `require`
 * with a string literal: esbuild rewrites it for ESM output and the build
 * restores it (`scripts/optional-peers.mjs`). This file loads and does nothing
 * else; the choice of renderer lives in `resolveGlassRenderer`.
 */
function loadGlassEffectExports(): unknown {
  let loaded: unknown;
  try {
    loaded = require("expo-glass-effect");
  } catch {
    loaded = undefined;
  }
  return loaded;
}

function loadBlurExports(): unknown {
  let loaded: unknown;
  try {
    loaded = require("expo-blur");
  } catch {
    loaded = undefined;
  }
  return loaded;
}

const peerExports: GlassPeerExports = {
  blur: loadBlurExports(),
  glassEffect: loadGlassEffectExports(),
};

/**
 * The renderer for a glass surface, from the optional peers this app
 * installed: Liquid Glass, a blur view, or `none`, which callers draw as the
 * solid fallback. Tests replace this module instead of the peers.
 *
 * @returns The renderer to draw with.
 */
function glassRenderer(): GlassRenderer {
  return resolveGlassRenderer(peerExports);
}

export { glassRenderer };
