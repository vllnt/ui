import type { ComponentType } from "react";
import type { ColorValue, ViewProps } from "react-native";

/** Props this package passes to `GlassView` from `expo-glass-effect`. */
export type GlassViewProps = ViewProps & {
  readonly colorScheme?: "auto" | "dark" | "light";
  readonly glassEffectStyle?: "clear" | "none" | "regular";
  readonly tintColor?: ColorValue;
};

/** Props this package passes to `BlurView` from `expo-blur`. */
export type BlurViewProps = ViewProps & {
  readonly intensity?: number;
  readonly tint?: "dark" | "light";
};

/** What draws a glass surface, decided from the installed optional peers. */
export type GlassRenderer =
  | {
      readonly blurView: ComponentType<BlurViewProps>;
      readonly kind: "blur";
    }
  | {
      readonly glassView: ComponentType<GlassViewProps>;
      readonly kind: "glass-effect";
    }
  | { readonly kind: "none" };

type GlassEffectPeer = {
  readonly glassView: ComponentType<GlassViewProps>;
  readonly isAvailable: () => boolean;
};

type BlurPeer = { readonly blurView: ComponentType<BlurViewProps> };

const emptyRecord: Readonly<Record<string, unknown>> = {};

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null;
}

function asRecord(value: unknown): Readonly<Record<string, unknown>> {
  return isRecord(value) ? value : emptyRecord;
}

function isComponentLike(value: unknown): boolean {
  return typeof value === "function" || "$$typeof" in asRecord(value);
}

function isGlassViewComponent(
  value: unknown,
): value is ComponentType<GlassViewProps> {
  return isComponentLike(value);
}

function isBlurViewComponent(
  value: unknown,
): value is ComponentType<BlurViewProps> {
  return isComponentLike(value);
}

function isCheck(value: unknown): value is () => unknown {
  return typeof value === "function";
}

/** A missing native module makes the check throw, which counts as no. */
function passes(check: () => unknown): boolean {
  try {
    return check() === true;
  } catch {
    return false;
  }
}

function toGlassEffectPeer(loaded: unknown): GlassEffectPeer | undefined {
  const {
    GlassView: glassView,
    isGlassEffectAPIAvailable: apiAvailable,
    isLiquidGlassAvailable: liquidGlassAvailable,
  } = asRecord(loaded);
  return isGlassViewComponent(glassView) &&
    isCheck(apiAvailable) &&
    isCheck(liquidGlassAvailable)
    ? {
        glassView,
        isAvailable: () => passes(liquidGlassAvailable) && passes(apiAvailable),
      }
    : undefined;
}

function toBlurPeer(loaded: unknown): BlurPeer | undefined {
  const { BlurView: blurView } = asRecord(loaded);
  return isBlurViewComponent(blurView) ? { blurView } : undefined;
}

/**
 * Loads each peer with a literal `require` in a `try` block at module scope.
 * Metro flags such a call as an optional dependency (Expo enables
 * `allowOptionalDependencies`), so an app without the peer still bundles, and
 * the `catch` absorbs the failed `require`. Keep it a plain `require`: esbuild
 * rewrites it for ESM output and the build restores it
 * (`scripts/optional-peers.mjs`).
 */
function loadGlassEffectPeer(): GlassEffectPeer | undefined {
  let peer: GlassEffectPeer | undefined;
  try {
    peer = toGlassEffectPeer(require("expo-glass-effect"));
  } catch {
    peer = undefined;
  }
  return peer;
}

function loadBlurPeer(): BlurPeer | undefined {
  let peer: BlurPeer | undefined;
  try {
    peer = toBlurPeer(require("expo-blur"));
  } catch {
    peer = undefined;
  }
  return peer;
}

const glassEffectPeer = loadGlassEffectPeer();
const blurPeer = loadBlurPeer();

/**
 * Picks the renderer for a glass surface. It returns Apple Liquid Glass when
 * `expo-glass-effect` is present and the device supports it (iOS 26+), else
 * `expo-blur` when present, else `none`, which callers draw as the solid
 * fallback.
 */
function glassRenderer(): GlassRenderer {
  if (glassEffectPeer?.isAvailable() === true) {
    return { glassView: glassEffectPeer.glassView, kind: "glass-effect" };
  }
  return blurPeer === undefined
    ? { kind: "none" }
    : { blurView: blurPeer.blurView, kind: "blur" };
}

export { glassRenderer };
