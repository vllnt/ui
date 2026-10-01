import {
  componentContracts,
  createNativeTheme,
  darkTheme,
  lightTheme,
  type NativeTheme,
  nativeTokens,
  type SemanticColorName,
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

/** Contrast contract from DESIGN.md §3: text pairs need 4.5:1 (WCAG 1.4.3). */
const TEXT_PAIRS: readonly ColorPair[] = [
  ["foreground", "background"],
  ["cardForeground", "card"],
  ["popoverForeground", "popover"],
  ["primaryForeground", "primary"],
  ["secondaryForeground", "secondary"],
  ["accentForeground", "accent"],
  ["destructiveForeground", "destructive"],
  ["mutedForeground", "background"],
  ["mutedForeground", "card"],
  ["mutedForeground", "popover"],
  ["mutedForeground", "muted"],
  ["destructive", "background"],
  ["destructive", "card"],
  ["destructive", "popover"],
  ["destructive", "muted"],
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

describe("generated design contracts", () => {
  it("emits native-safe colors for both schemes", () => {
    const themes = [lightTheme, darkTheme];
    expect(
      themes.every((theme) => Object.keys(theme.colors).length === 19),
    ).toBe(true);
    expect(
      themes
        .flatMap((theme) => Object.values(theme.colors))
        .every((color) => /^#[\da-f]{6}$/.test(color)),
    ).toBe(true);
    expect(darkTheme.colors.background).not.toBe("#000000");
  });

  describe.each([
    ["light", lightTheme],
    ["dark", darkTheme],
  ] as const)("%s contrast contract", (_, theme) => {
    it("keeps every text pair at 4.5:1", () => {
      expect(contrastFailures(theme.colors, TEXT_PAIRS, 4.5)).toEqual([]);
    });

    it("keeps destructive text legible on its 10% tint", () => {
      const { background, destructive } = theme.colors;
      expect(
        contrastRatio(destructive, tint(destructive, 0.1, background)),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it("keeps control boundaries and the focus ring at 3:1", () => {
      expect(contrastFailures(theme.colors, BOUNDARY_PAIRS, 3)).toEqual([]);
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

describe("createNativeTheme", () => {
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
