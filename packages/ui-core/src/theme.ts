import {
  nativeTokens,
  type SemanticColorName,
} from "./generated/design-tokens";

/** Color modes available to renderer adapters. */
export type ThemeColorScheme = keyof typeof nativeTokens.color;

type NumberMap<T> = {
  readonly [Key in keyof T]: number;
};

type StringMap<T> = {
  readonly [Key in keyof T]: string;
};

type NativeFontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

/**
 * A shadow in React Native terms: the iOS shadow props plus the Android
 * `elevation`. Generated from a CSS shadow token; the mapping rule is on
 * `nativeShadow` in `packages/design/scripts/generate-tokens.mjs`.
 */
export type NativeShadow = {
  readonly elevation: number;
  readonly shadowColor: string;
  readonly shadowOffset: {
    readonly height: number;
    readonly width: number;
  };
  readonly shadowOpacity: number;
  readonly shadowRadius: number;
};

type GlassSurfaceTokens = {
  readonly blur: NumberMap<typeof nativeTokens.glass.light.blur>;
  readonly foreground: string;
  readonly hairline: string;
  readonly input: string;
  readonly mutedForeground: string;
  readonly shadow: {
    readonly [Key in keyof typeof nativeTokens.glass.light.shadow]: NativeShadow;
  };
  readonly tint: StringMap<typeof nativeTokens.glass.light.tint>;
};

/**
 * The glass material for one color scheme, named after the design tokens:
 * `tint` is `material.glass.tint-*`, `hairline` is `material.glass.hairline`,
 * `mutedForeground` and `input` are `color.glass-muted-foreground` and
 * `color.glass-input`, `blur` is `blur.glass`, `shadow` is `shadow.glass` and
 * `shadow.glass-floating`. Tint and hairline colors carry alpha as `#rrggbbaa`.
 * `foreground` is the base foreground role, which text on glass keeps.
 *
 * `solid` is the same surface with glass off (Reduce Transparency, High
 * Contrast, `material="solid"`): opaque colors, no blur, the raised shadows.
 * A renderer swaps `glass` for `glass.solid` and draws the same way.
 */
export type NativeGlassTokens = GlassSurfaceTokens & {
  readonly solid: GlassSurfaceTokens;
};

/** Platform-neutral, React Native-compatible theme contract. */
export type NativeTheme = {
  readonly colors: Readonly<Record<SemanticColorName, string>>;
  readonly colorScheme: ThemeColorScheme;
  readonly glass: NativeGlassTokens;
  readonly motion: {
    readonly duration: NumberMap<typeof nativeTokens.motion.duration>;
  };
  readonly radius: NumberMap<typeof nativeTokens.radius>;
  readonly spacing: NumberMap<typeof nativeTokens.spacing>;
  readonly typography: {
    readonly fontWeight: {
      readonly [Key in keyof typeof nativeTokens.typography.fontWeight]: NativeFontWeight;
    };
    readonly scale: {
      readonly [Key in keyof typeof nativeTokens.typography.scale]: {
        readonly fontSize: number;
        readonly lineHeight: number;
      };
    };
  };
};

/** Supported semantic overrides for a generated native theme. */
export type NativeThemeOverride = {
  readonly colors?: Partial<NativeTheme["colors"]>;
  readonly motion?: {
    readonly duration?: Partial<NativeTheme["motion"]["duration"]>;
  };
  readonly radius?: Partial<NativeTheme["radius"]>;
  readonly spacing?: Partial<NativeTheme["spacing"]>;
  readonly typography?: {
    readonly fontWeight?: Partial<NativeTheme["typography"]["fontWeight"]>;
    readonly scale?: Partial<NativeTheme["typography"]["scale"]>;
  };
};

/** Generated light theme. Values are sRGB colors and density-independent points. */
export const lightTheme: NativeTheme = {
  colors: nativeTokens.color.light,
  colorScheme: "light",
  glass: nativeTokens.glass.light,
  motion: nativeTokens.motion,
  radius: nativeTokens.radius,
  spacing: nativeTokens.spacing,
  typography: nativeTokens.typography,
};

/** Generated dark theme. Values are sRGB colors and density-independent points. */
export const darkTheme: NativeTheme = {
  ...lightTheme,
  colors: nativeTokens.color.dark,
  colorScheme: "dark",
  glass: nativeTokens.glass.dark,
};

/** Merges `override` onto `base`, ignoring `undefined` values so a token is never erased. */
function merge<T extends object>(base: T, override?: Partial<T>): T {
  const defined = Object.entries(override ?? {}).filter(
    ([, value]) => value !== undefined,
  );
  return { ...base, ...Object.fromEntries(defined) };
}

/**
 * Creates a native theme while preserving every required semantic token.
 * `undefined` override values keep the default; any scheme other than
 * `"dark"` produces the light theme.
 */
export function createNativeTheme(
  colorScheme: ThemeColorScheme,
  override: NativeThemeOverride = {},
): NativeTheme {
  const base = colorScheme === "dark" ? darkTheme : lightTheme;
  return {
    colors: merge(base.colors, override.colors),
    colorScheme: base.colorScheme,
    glass: base.glass,
    motion: {
      duration: merge(base.motion.duration, override.motion?.duration),
    },
    radius: merge(base.radius, override.radius),
    spacing: merge(base.spacing, override.spacing),
    typography: {
      fontWeight: merge(
        base.typography.fontWeight,
        override.typography?.fontWeight,
      ),
      scale: merge(base.typography.scale, override.typography?.scale),
    },
  };
}
