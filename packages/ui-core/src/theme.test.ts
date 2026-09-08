import {
  componentContracts,
  createNativeTheme,
  darkTheme,
  lightTheme,
  nativeTokens,
} from "./index";

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
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

  it("keeps native control labels at WCAG AA contrast", () => {
    expect(
      [lightTheme, darkTheme].every(
        (theme) =>
          contrastRatio(
            theme.colors.destructive,
            theme.colors.destructiveForeground,
          ) >= 4.5,
      ),
    ).toBe(true);
    expect(
      [lightTheme, darkTheme].every(
        (theme) =>
          contrastRatio(theme.colors.primary, theme.colors.primaryForeground) >=
          4.5,
      ),
    ).toBe(true);
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
