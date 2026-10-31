import {
  nativeTokens,
  type SemanticColorName,
} from "./generated/design-tokens";

/** Color modes available to renderer adapters. */
export type ThemeColorScheme = keyof typeof nativeTokens.color;

type NumberMap<T> = {
  readonly [Key in keyof T]: number;
};

type NativeFontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

/** Platform-neutral, React Native-compatible theme contract. */
export type NativeTheme = {
  readonly colors: Readonly<Record<SemanticColorName, string>>;
  readonly colorScheme: ThemeColorScheme;
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
