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
      readonly kind: "glass";
    }
  | { readonly kind: "none" };

/**
 * The loaded exports of each optional peer. A peer that is not installed has
 * no entry, or `undefined`.
 */
export type GlassPeerExports = {
  /** Exports of `expo-blur`. */
  readonly blur?: unknown;
  /** Exports of `expo-glass-effect`. */
  readonly glassEffect?: unknown;
};

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
 * Picks the renderer for a glass surface from the exports of the optional
 * peers. It returns Apple Liquid Glass when `expo-glass-effect` is present and
 * the device supports it (iOS 26+), else `expo-blur` when present, else
 * `none`, which callers draw as the solid fallback. Exports that are missing
 * or malformed count as a peer that is not installed.
 *
 * The function is pure: tests pass plain objects, and the loader in
 * `glass-peers` passes the real module exports.
 *
 * @param peers Loaded exports of `expo-glass-effect` and `expo-blur`.
 * @returns The renderer to draw with.
 * @example
 * const { kind } = resolveGlassRenderer({ glassEffect: loadedExports });
 */
function resolveGlassRenderer({
  blur,
  glassEffect,
}: GlassPeerExports): GlassRenderer {
  const glassPeer = toGlassEffectPeer(glassEffect);
  if (glassPeer?.isAvailable() === true) {
    return { glassView: glassPeer.glassView, kind: "glass" };
  }
  const blurPeer = toBlurPeer(blur);
  return blurPeer === undefined
    ? { kind: "none" }
    : { blurView: blurPeer.blurView, kind: "blur" };
}

export { resolveGlassRenderer };
