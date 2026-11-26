import type { ReactNode } from "react";

import { darkTheme, lightTheme } from "@vllnt/ui-core";

import {
  fakeService,
  hostsOf,
  NO_PEERS,
  settlePreferences,
  withGlassSandbox,
} from "../tests/glass-fixtures";
import { styleOf } from "../tests/test-utils";

// Each test loads React Native and the test renderer into a fresh registry.
jest.setTimeout(30_000);

const THEMES = { dark: darkTheme, light: lightTheme } as const;
const SCHEMES = ["light", "dark"] as const;
const VARIANTS = ["regular", "dense"] as const;

/** WCAG 2.2 AA: text needs 4.5:1, a control boundary needs 3:1. */
const TEXT_RATIO = 4.5;
const BOUNDARY_RATIO = 3;

/** The color string a rendered style or hook gave, or a failure if it gave none. */
function colorOf(value: unknown): string {
  if (typeof value !== "string") throw new Error("Expected a color string");
  return value;
}

function luminance(hex: string): number {
  const [red = 0, green = 0, blue = 0] = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(first: string, second: string): number {
  const [light, dark] = [luminance(first), luminance(second)].sort(
    (left, right) => right - left,
  );
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

describe("contrast helper", () => {
  it("measures black on white as 21:1 and equal colors as 1:1", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#777777", "#777777")).toBeCloseTo(1, 5);
  });
});

describe("GlassSurface solid fallback contrast", () => {
  describe.each(SCHEMES)("%s mode", (scheme) => {
    it.each(VARIANTS)(
      "keeps text and the control boundary legible on the %s surface",
      async (variant) => {
        await withGlassSandbox(NO_PEERS, async (sandbox) => {
          const fake = fakeService();
          const { GlassSurface, useGlassTextColor } = sandbox.surface;
          const { ThemeProvider } = sandbox.theme;
          function wrapper({ children }: { readonly children: ReactNode }) {
            return (
              <ThemeProvider colorScheme={scheme}>
                <GlassSurface
                  accessibilityService={fake.service}
                  testID="surface"
                  variant={variant}
                >
                  {children}
                </GlassSurface>
              </ThemeProvider>
            );
          }
          const { result } = sandbox.testing.renderHook(
            () => ({
              muted: useGlassTextColor("muted"),
              text: useGlassTextColor("default"),
            }),
            { wrapper },
          );
          await settlePreferences(sandbox.testing);

          const [surface] = hostsOf(sandbox.testing.screen.toJSON());
          const ground = colorOf(styleOf(surface).backgroundColor);
          const text = colorOf(result.current.text);
          const muted = colorOf(result.current.muted);
          expect(ground).toBe(
            variant === "dense"
              ? THEMES[scheme].glass.solid.tint.denseTop
              : THEMES[scheme].glass.solid.tint.top,
          );
          expect(contrast(text, ground)).toBeGreaterThanOrEqual(TEXT_RATIO);
          expect(contrast(muted, ground)).toBeGreaterThanOrEqual(TEXT_RATIO);
          expect(
            contrast(THEMES[scheme].glass.solid.input, ground),
          ).toBeGreaterThanOrEqual(BOUNDARY_RATIO);
        });
      },
    );
  });
});
