"use client";

import {
  type ComponentType,
  createContext,
  type Ref,
  use,
  useMemo,
} from "react";

import type { TextTone, ThemeColorScheme } from "@vllnt/ui-core";
import {
  type StyleProp,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../theme/theme-provider";

import {
  type BlurViewProps,
  type GlassRenderer,
  glassRenderer,
  type GlassViewProps,
} from "./glass-peers";
import type { Material, MaterialProps } from "./material";
import {
  type GlassAccessibilityService,
  useGlassAvailability,
} from "./use-glass-availability";

/** Props for {@link GlassSurface}. */
export type GlassSurfaceProps = MaterialProps &
  ViewProps & {
    /**
     * Source of the Reduce Transparency and contrast preferences. Tests inject
     * a fake; the default reads `AccessibilityInfo`.
     */
    readonly accessibilityService?: GlassAccessibilityService;
    /** Draws the stronger `glassFloating` shadow, for docks, menus and sheets. */
    readonly elevated?: boolean;
    readonly ref?: Ref<View>;
    /**
     * `dense` uses the denser tint for panels with body text, muted text or a
     * control border. Defaults to `regular`.
     */
    readonly variant?: "dense" | "regular";
  };

type GlassSurfaceColors = {
  readonly foreground: string;
  readonly material: Material;
  readonly mutedForeground: string;
};

type DrawnGlass = Exclude<GlassRenderer, { readonly kind: "none" }>;

const GlassSurfaceContext = createContext<GlassSurfaceColors | undefined>(
  undefined,
);

const solidRenderer: GlassRenderer = { kind: "none" };

/**
 * `expo-blur` takes an intensity from 1 to 100. On Android it divides the
 * intensity by `blurReductionFactor` (4 by default) to get a radius, so this
 * package multiplies the token radius by 4 to land on the same radius. The
 * default token (20) gives 80; the largest blur token (24) would give 96.
 */
const BLUR_INTENSITY_PER_RADIUS = 4;

function blurIntensity(radius: number): number {
  return radius * BLUR_INTENSITY_PER_RADIUS;
}

type GlassEffectLayerProps = {
  readonly colorScheme: ThemeColorScheme;
  readonly glassView: ComponentType<GlassViewProps>;
  readonly tint: string;
};

/** Apple Liquid Glass, tinted with the token tint. */
function GlassEffectLayer({
  colorScheme,
  glassView: GlassView,
  tint,
}: GlassEffectLayerProps) {
  return (
    <GlassView
      colorScheme={colorScheme}
      glassEffectStyle="regular"
      style={StyleSheet.absoluteFill}
      tintColor={tint}
    />
  );
}
GlassEffectLayer.displayName = "GlassEffectLayer";

type BlurLayerProps = {
  readonly blurView: ComponentType<BlurViewProps>;
  readonly colorScheme: ThemeColorScheme;
  readonly radius: number;
  readonly tint: string;
};

/** A backdrop blur with the token tint over it. */
function BlurLayer({
  blurView: BlurView,
  colorScheme,
  radius,
  tint,
}: BlurLayerProps) {
  return (
    <>
      <BlurView
        intensity={blurIntensity(radius)}
        style={StyleSheet.absoluteFill}
        tint={colorScheme}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
    </>
  );
}
BlurLayer.displayName = "BlurLayer";

type GlassBackdropProps = {
  readonly blurRadius: number;
  readonly borderRadius: ViewStyle["borderRadius"];
  readonly colorScheme: ThemeColorScheme;
  readonly hairline: string;
  readonly renderer: DrawnGlass;
  readonly tint: string;
};

/**
 * The decorative layers behind a glass surface's children: the blur or glass
 * view clipped to the corner radius, then the hairline on top. Screen readers
 * and touches skip both.
 */
function GlassBackdrop({
  blurRadius,
  borderRadius,
  colorScheme,
  hairline,
  renderer,
  tint,
}: GlassBackdropProps) {
  return (
    <>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { borderRadius, overflow: "hidden" }]}
      >
        {renderer.kind === "glass-effect" ? (
          <GlassEffectLayer
            colorScheme={colorScheme}
            glassView={renderer.glassView}
            tint={tint}
          />
        ) : (
          <BlurLayer
            blurView={renderer.blurView}
            colorScheme={colorScheme}
            radius={blurRadius}
            tint={tint}
          />
        )}
      </View>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { borderColor: hairline, borderRadius, borderWidth: 1 },
        ]}
      />
    </>
  );
}
GlassBackdrop.displayName = "GlassBackdrop";

/**
 * Static container that draws the glass material: Apple Liquid Glass on iOS 26+
 * when `expo-glass-effect` is present, else a backdrop blur (`expo-blur`)
 * under the token tint, plus a hairline border and a shadow. It falls back to
 * the opaque solid tokens when `material="solid"`, inside a solid surface,
 * under Reduce Transparency or a high-contrast setting, when `ThemeProvider`
 * sets `glass={false}`, and when neither peer is present.
 *
 * It never responds to press or hover and adds no accessibility role. Set the
 * corner radius with `style.borderRadius`; per-corner radii are not supported
 * on glass. The surface does not clip its children, because a clip would cut
 * the iOS shadow.
 */
function GlassSurface({
  accessibilityService,
  children,
  elevated = false,
  material = "glass",
  ref,
  style,
  variant = "regular",
  ...props
}: GlassSurfaceProps) {
  const theme = useTheme();
  const parent = use(GlassSurfaceContext);
  const available = useGlassAvailability(accessibilityService);
  const renderer =
    material === "glass" && parent?.material !== "solid" && available
      ? glassRenderer()
      : solidRenderer;
  const tokens = renderer.kind === "none" ? theme.glass.solid : theme.glass;
  const tint = variant === "dense" ? tokens.tint.denseTop : tokens.tint.top;
  const solidLook =
    renderer.kind === "none"
      ? { backgroundColor: tint, borderColor: tokens.hairline, borderWidth: 1 }
      : undefined;
  const surfaceStyle: StyleProp<ViewStyle> = [
    { borderRadius: theme.radius.surface },
    solidLook,
    elevated ? tokens.shadow.glassFloating : tokens.shadow.glass,
    style,
  ];
  const colors = useMemo<GlassSurfaceColors>(
    () => ({
      foreground: tokens.foreground,
      material: renderer.kind === "none" ? "solid" : "glass",
      mutedForeground: tokens.mutedForeground,
    }),
    [renderer.kind, tokens.foreground, tokens.mutedForeground],
  );

  return (
    <View {...props} ref={ref} style={surfaceStyle}>
      {renderer.kind === "none" ? undefined : (
        <GlassBackdrop
          blurRadius={theme.glass.blur.default}
          borderRadius={StyleSheet.flatten(surfaceStyle).borderRadius}
          colorScheme={theme.colorScheme}
          hairline={tokens.hairline}
          renderer={renderer}
          tint={tint}
        />
      )}
      <GlassSurfaceContext value={colors}>{children}</GlassSurfaceContext>
    </View>
  );
}
GlassSurface.displayName = "GlassSurface";

/**
 * Text color the nearest {@link GlassSurface} sets for `tone`: the glass
 * foreground colors while glass draws, the solid ones in the fallback. It
 * returns `undefined` outside a surface, so the caller keeps its own color.
 *
 * @param tone Text tone, `default` or `muted`.
 * @returns The surface's text color, or `undefined` outside a surface.
 */
function useGlassTextColor(tone: TextTone): string | undefined {
  const colors = use(GlassSurfaceContext);
  return tone === "muted" ? colors?.mutedForeground : colors?.foreground;
}

export { GlassSurface, useGlassTextColor };
