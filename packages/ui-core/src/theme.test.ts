import {
  componentContracts,
  createNativeTheme,
  darkTheme,
  designTokens,
  lightTheme,
  type NativeTheme,
  nativeTokens,
  productThemes,
  type SemanticColorName,
  tamaguiThemes,
  tamaguiTokens,
} from "./index";

function hexChannels(hex: string): number[] {
  return [1, 3, 5].map((offset) =>
    Number.parseInt(hex.slice(offset, offset + 2), 16),
  );
}

function relativeLuminance(hex: string): number {
  const channels = hexChannels(hex)
    .map((channel) => channel / 255)
    .map((channel) =>
      channel <= 0.040_45
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  const red = channels[0] ?? 0;
  const green = channels[1] ?? 0;
  const blue = channels[2] ?? 0;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first: string, second: string): number {
  const light = Math.max(relativeLuminance(first), relativeLuminance(second));
  const dark = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (light + 0.05) / (dark + 0.05);
}

/** `color` at `alpha` over `surface`, blended per sRGB channel like a renderer. */
function tint(color: string, alpha: number, surface: string): string {
  const over = hexChannels(surface);
  return `#${hexChannels(color)
    .map((channel, index) =>
      Math.round(channel * alpha + (over[index] ?? 0) * (1 - alpha))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

type ColorPair = readonly [SemanticColorName, SemanticColorName];

const STATUS_ON_COLOR = {
  destructive: "destructiveForeground",
  info: "infoForeground",
  success: "successForeground",
  warning: "warningForeground",
} as const satisfies Record<string, SemanticColorName>;

type StatusRole = keyof typeof STATUS_ON_COLOR;

const STATUS_ROLES: readonly StatusRole[] = [
  "destructive",
  "info",
  "success",
  "warning",
];

const STATUS_SURFACES = [
  "background",
  "card",
  "popover",
  "muted",
] as const satisfies readonly SemanticColorName[];

/** Contrast contract from DESIGN.md §3: text pairs need 4.5:1 (WCAG 1.4.3). */
const TEXT_PAIRS: readonly ColorPair[] = [
  ["foreground", "background"],
  ["cardForeground", "card"],
  ["popoverForeground", "popover"],
  ["primaryForeground", "primary"],
  ["secondaryForeground", "secondary"],
  ["accentForeground", "accent"],
  ["mutedForeground", "background"],
  ["mutedForeground", "card"],
  ["mutedForeground", "popover"],
  ["mutedForeground", "muted"],
  ["foreground", "diffAdded"],
  ["foreground", "diffRemoved"],
  ...STATUS_ROLES.flatMap((role): ColorPair[] => [
    [STATUS_ON_COLOR[role], role],
    ...STATUS_SURFACES.map((surface): ColorPair => [role, surface]),
  ]),
];

/** Control boundaries and the focus ring need 3:1 (WCAG 1.4.11). */
const BOUNDARY_PAIRS: readonly ColorPair[] = [
  ["input", "background"],
  ["input", "card"],
  ["input", "popover"],
  ["ring", "background"],
];

function contrastFailures(
  colors: NativeTheme["colors"],
  pairs: readonly ColorPair[],
  minimum: number,
): string[] {
  return pairs
    .map(([foreground, surface]) => ({
      ratio: contrastRatio(colors[foreground], colors[surface]),
      where: `${foreground} on ${surface}`,
    }))
    .filter(({ ratio }) => ratio < minimum)
    .map(({ ratio, where }) => `${where}: ${ratio.toFixed(2)}:1`);
}

const SEMANTIC_ROLES = Object.keys(designTokens.color.semantic);

const COLOR_SETS: readonly (readonly [string, NativeTheme["colors"]])[] = [
  ["core light", lightTheme.colors],
  ["core dark", darkTheme.colors],
  ["maia light", productThemes.maia.colors.light],
  ["maia dark", productThemes.maia.colors.dark],
  ["paas light", productThemes.paas.colors.light],
  ["paas dark", productThemes.paas.colors.dark],
];

describe("generated design contracts", () => {
  it("emits native-safe colors for both schemes", () => {
    const themes = [lightTheme, darkTheme];
    expect(
      themes.every(
        (theme) => Object.keys(theme.colors).length === SEMANTIC_ROLES.length,
      ),
    ).toBe(true);
    expect(
      themes
        .flatMap((theme) => Object.values(theme.colors))
        .every((color) => /^#[\da-f]{6}$/.test(color)),
    ).toBe(true);
    expect(darkTheme.colors.background).not.toBe("#000000");
  });

  it("defines the status and diff roles next to the shadcn set", () => {
    expect(SEMANTIC_ROLES).toEqual(
      expect.arrayContaining([
        "success",
        "successForeground",
        "warning",
        "warningForeground",
        "info",
        "infoForeground",
        "diffAdded",
        "diffRemoved",
      ]),
    );
  });

  describe.each(COLOR_SETS)("%s contrast contract", (_, colors) => {
    it("keeps every text pair at 4.5:1", () => {
      expect(contrastFailures(colors, TEXT_PAIRS, 4.5)).toEqual([]);
    });

    it("keeps status text legible on its 10% tint", () => {
      const failures = STATUS_ROLES.filter(
        (role) =>
          contrastRatio(
            colors[role],
            tint(colors[role], 0.1, colors.background),
          ) < 4.5,
      );
      expect(failures).toEqual([]);
    });

    it("keeps control boundaries and the focus ring at 3:1", () => {
      expect(contrastFailures(colors, BOUNDARY_PAIRS, 3)).toEqual([]);
    });
  });

  it("converts shared dimensions to native points", () => {
    expect(nativeTokens.spacing[1]).toBe(4);
    expect(nativeTokens.spacing[4]).toBe(16);
    expect(nativeTokens.spacing[16]).toBe(64);
    expect(nativeTokens.radius).toMatchObject({ full: 9999, md: 8 });
    expect(nativeTokens.typography.scale.body).toEqual({
      fontSize: 16,
      lineHeight: 25.6,
    });
  });

  it("keeps the portable pilot contract explicit", () => {
    expect(componentContracts.components.button.variants).toEqual([
      "default",
      "destructive",
      "ghost",
      "link",
      "outline",
      "secondary",
    ]);
    expect(componentContracts.components.heading.levels).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });
});

describe("product themes", () => {
  it.each(Object.entries(productThemes))(
    "%s defines every core role in both modes",
    (_, theme) => {
      expect(Object.keys(theme.colors.light).sort()).toEqual(
        [...SEMANTIC_ROLES].sort(),
      );
      expect(Object.keys(theme.colors.dark).sort()).toEqual(
        [...SEMANTIC_ROLES].sort(),
      );
    },
  );

  it("maps Maia's accent onto primary and keeps core accent a quiet surface", () => {
    const { dark, light } = productThemes.maia.colors;
    expect(dark.primary).toBe("#f46cbf");
    expect(dark.background).toBe("#000000");
    expect(light.primary).toBe("#be148b");
    expect(light.background).toBe("#ffffff");
    expect(dark.accent).toBe(dark.muted);
    expect(light.accent).toBe(light.muted);
  });

  it("keeps PaaS on the core neutrals and status tones", () => {
    const { dark, light } = productThemes.paas.colors;
    expect(light.primary).toBe(lightTheme.colors.primary);
    expect(dark.primary).toBe(darkTheme.colors.primary);
    expect(light.success).toBe(lightTheme.colors.success);
    expect(dark.warning).toBe(darkTheme.colors.warning);
    expect(productThemes.paas.defaultMode).toBe("dark");
    expect(productThemes.maia.defaultMode).toBeNull();
  });

  it("sets each theme's typefaces", () => {
    expect(productThemes.maia.typography.fontFamily).toEqual({
      display: "Figtree",
      mono: "JetBrains Mono",
      sans: "Figtree",
    });
    expect(productThemes.paas.typography.fontFamily).toEqual({
      display: "JetBrains Mono",
      mono: "JetBrains Mono",
      sans: "JetBrains Mono",
    });
  });

  it("carries Maia's type scale and radius steps in points", () => {
    const { radius, typography } = productThemes.maia;
    expect(radius).toMatchObject({ lg: 12, md: 8, sm: 6, xl: 16 });
    expect(typography.scale.display.fontSize).toBe(28);
    expect(typography.scale.h5.fontSize).toBe(20);
    expect(typography.scale.h6.fontSize).toBe(15);
    expect(typography.scale.body.fontSize).toBe(14);
    expect(typography.scale.bodySmall.fontSize).toBe(13);
    expect(typography.scale.caption.fontSize).toBe(12);
    expect(typography.scale.label.fontSize).toBe(11);
    expect(typography.fontWeight).toMatchObject({
      body: 400,
      caption: 500,
      display: 700,
      heading: 600,
      label: 700,
    });
  });

  it("leaves product-specific status names out of the core roles", () => {
    expect(
      SEMANTIC_ROLES.filter((role) =>
        /implemented|candidate|deprecated|unsupported|planned|attention/i.test(
          role,
        ),
      ),
    ).toEqual([]);
  });
});

describe("tamagui output", () => {
  it("keys one theme per product and mode", () => {
    expect(Object.keys(tamaguiThemes).sort()).toEqual([
      "maia_dark",
      "maia_light",
      "paas_dark",
      "paas_light",
    ]);
  });

  it("derives each theme from the matching product palette", () => {
    expect(tamaguiThemes.maia_dark).toMatchObject({
      background: productThemes.maia.colors.dark.background,
      borderColor: productThemes.maia.colors.dark.border,
      color: productThemes.maia.colors.dark.foreground,
      primary: "#f46cbf",
    });
    expect(tamaguiThemes.paas_light).toMatchObject({
      background: productThemes.paas.colors.light.background,
      borderColor: productThemes.paas.colors.light.border,
      color: productThemes.paas.colors.light.foreground,
    });
  });

  it("gives every theme the same keys with hex values", () => {
    const [first, ...rest] = Object.values(tamaguiThemes);
    const keys = Object.keys(first ?? {}).sort();
    expect(rest.map((theme) => Object.keys(theme).sort())).toEqual(
      rest.map(() => keys),
    );
    expect(
      Object.values(tamaguiThemes)
        .flatMap((theme) => Object.values(theme))
        .every((color) => /^#[\da-f]{6}$/.test(color)),
    ).toBe(true);
  });

  it("exposes the groups Tamagui's createTokens takes", () => {
    expect(Object.keys(tamaguiTokens).sort()).toEqual([
      "color",
      "radius",
      "size",
      "space",
      "zIndex",
    ]);
    expect(tamaguiTokens.space[5]).toBe(20);
    expect(tamaguiTokens.space[10]).toBe(40);
    expect(tamaguiTokens.radius.xl).toBe(16);
    expect(tamaguiTokens.color.primaryDark).toBe(darkTheme.colors.primary);
  });
});

describe("createNativeTheme", () => {
  it("accepts a product palette as its color override", () => {
    const theme = createNativeTheme("dark", {
      colors: productThemes.maia.colors.dark,
    });

    expect(theme.colors.primary).toBe("#f46cbf");
    expect(theme.colors.background).toBe("#000000");
  });

  it("merges semantic overrides without dropping defaults", () => {
    const theme = createNativeTheme("dark", {
      colors: { primary: "#123456" },
      spacing: { [4]: 20 },
    });

    expect(theme.colorScheme).toBe("dark");
    expect(theme.colors.primary).toBe("#123456");
    expect(theme.colors.background).toBe(darkTheme.colors.background);
    expect(theme.spacing[4]).toBe(20);
    expect(theme.spacing[2]).toBe(darkTheme.spacing[2]);
  });
});

describe("createNativeTheme input handling", () => {
  it("keeps the default token when an override value is undefined", () => {
    const theme = createNativeTheme("light", {
      colors: { primary: undefined },
      spacing: { [4]: undefined },
    });

    expect(theme.colors.primary).toBe(lightTheme.colors.primary);
    expect(theme.spacing[4]).toBe(lightTheme.spacing[4]);
  });

  it("falls back to the light theme for an unknown color scheme", () => {
    const theme = createNativeTheme("system" as never);

    expect(theme.colorScheme).toBe("light");
    expect(theme.colors).toEqual(lightTheme.colors);
  });

  it("does not mutate the shared themes", () => {
    createNativeTheme("dark", { colors: { primary: "#123456" } });

    expect(darkTheme.colors.primary).not.toBe("#123456");
  });
});
