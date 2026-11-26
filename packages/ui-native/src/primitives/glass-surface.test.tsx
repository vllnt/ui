import { createRef, type ReactNode } from "react";

import { act, render, renderHook, screen } from "@testing-library/react-native";
import { darkTheme, lightTheme } from "@vllnt/ui-core";
import { AccessibilityInfo, Text, type View } from "react-native";

import {
  BLUR_RENDERER,
  childrenOf,
  type FakeService,
  fakeService,
  type FakeServiceState,
  GLASS_RENDERER,
  GlassHarness,
  hostsOf,
  hostsOfType,
  NO_RENDERER,
  type RenderedHost,
  settlePreferences,
} from "../tests/glass-fixtures";
import { styleOf } from "../tests/test-utils";
import { ThemeProvider, useGlassEnabled } from "../theme/theme-provider";

import { glassRenderer } from "./glass-peers";
import type { GlassRenderer } from "./glass-renderer";
import {
  GlassSurface,
  type GlassSurfaceProps,
  useGlassTextColor,
} from "./glass-surface";

jest.mock("./glass-peers", () => ({ glassRenderer: jest.fn() }));

const mockedRenderer = jest.mocked(glassRenderer);

const THEMES = { dark: darkTheme, light: lightTheme } as const;
const SCHEMES = ["light", "dark"] as const;
const PREFERENCES = [
  "darkerSystemColors",
  "highTextContrast",
  "reduceTransparency",
] as const;

type RenderOptions = {
  readonly colorScheme?: "dark" | "light";
  readonly fake?: FakeService;
  readonly glass?: boolean;
  readonly state?: FakeServiceState;
};

function required<T>(value: T | undefined, name: string): T {
  if (value === undefined) throw new Error(`Missing ${name}`);
  return value;
}

function root(): RenderedHost {
  return required(hostsOf(screen.toJSON())[0], "rendered root");
}

function byTestId(host: RenderedHost, testID: string): RenderedHost {
  return required(
    hostsOf(host).find((candidate) => candidate.props.testID === testID),
    `host ${testID}`,
  );
}

/** The decorative layer that clips the blur or glass view to the corner radius. */
function clipLayer(host: RenderedHost): RenderedHost {
  return required(
    hostsOf(host).find((candidate) => styleOf(candidate).overflow === "hidden"),
    "clip layer",
  );
}

/** The decorative overlay that draws the hairline above the blur or glass. */
function hairlineLayer(host: RenderedHost): RenderedHost {
  return required(
    hostsOf(host).find(
      (candidate) => candidate !== host && styleOf(candidate).borderWidth === 1,
    ),
    "hairline layer",
  );
}

/**
 * Renders a surface that draws with `renderer` and waits for the fake platform
 * preferences to answer. The peers never load, because this file replaces
 * `glass-peers`.
 */
async function renderSurface(
  renderer: GlassRenderer,
  props: GlassSurfaceProps = {},
  options: RenderOptions = {},
) {
  const fake = options.fake ?? fakeService(options.state);
  mockedRenderer.mockReturnValue(renderer);
  render(
    <GlassHarness
      colorScheme={options.colorScheme ?? "light"}
      fake={fake}
      glass={options.glass}
    >
      <GlassSurface testID="surface" {...props} />
    </GlassHarness>,
  );
  await settlePreferences();
  return { fake };
}

async function change(run: () => void): Promise<void> {
  await act(async () => {
    run();
    await Promise.resolve();
  });
}

describe("GlassSurface with Liquid Glass", () => {
  it.each(SCHEMES)("draws a GlassView with the %s tint", async (scheme) => {
    await renderSurface(GLASS_RENDERER, {}, { colorScheme: scheme });

    const [view] = hostsOfType(root(), "GlassView");
    expect(view?.props).toMatchObject({
      colorScheme: scheme,
      glassEffectStyle: "regular",
      tintColor: THEMES[scheme].glass.tint.top,
    });
    expect(hostsOfType(root(), "BlurView")).toEqual([]);
  });

  it("uses the denser tint for the dense variant", async () => {
    await renderSurface(GLASS_RENDERER, { variant: "dense" });

    expect(hostsOfType(root(), "GlassView")[0]?.props.tintColor).toBe(
      lightTheme.glass.tint.denseTop,
    );
  });

  it("leaves the paint to the glass: surface radius and shadow only", async () => {
    await renderSurface(GLASS_RENDERER);

    const style = styleOf(root());
    expect(style).toMatchObject({
      borderRadius: lightTheme.radius.surface,
      ...lightTheme.glass.shadow.glass,
    });
    expect(style).not.toHaveProperty("backgroundColor");
    expect(style).not.toHaveProperty("borderWidth");
  });

  it("raises the shadow when elevated", async () => {
    await renderSurface(GLASS_RENDERER, { elevated: true });

    expect(styleOf(root())).toMatchObject(
      lightTheme.glass.shadow.glassFloating,
    );
  });

  it("draws the hairline above the glass and hides both layers", async () => {
    await renderSurface(GLASS_RENDERER);

    expect(styleOf(hairlineLayer(root()))).toMatchObject({
      borderColor: lightTheme.glass.hairline,
      borderWidth: 1,
    });
    for (const layer of [clipLayer(root()), hairlineLayer(root())]) {
      expect(layer.props).toMatchObject({
        accessibilityElementsHidden: true,
        importantForAccessibility: "no-hide-descendants",
        pointerEvents: "none",
      });
    }
  });

  it("clips the glass and draws the hairline at the caller's radius", async () => {
    await renderSurface(GLASS_RENDERER, {
      style: { borderRadius: 20, margin: 4 },
    });

    expect(styleOf(root())).toMatchObject({ borderRadius: 20, margin: 4 });
    expect(styleOf(clipLayer(root())).borderRadius).toBe(20);
    expect(styleOf(hairlineLayer(root())).borderRadius).toBe(20);
  });
});

describe("GlassSurface with only expo-blur", () => {
  it.each(SCHEMES)("draws a BlurView for %s over the tint", async (scheme) => {
    await renderSurface(BLUR_RENDERER, {}, { colorScheme: scheme });

    const [view] = hostsOfType(root(), "BlurView");
    expect(view?.props).toMatchObject({ intensity: 80, tint: scheme });
    const fills = hostsOf(root()).filter(
      (host) => styleOf(host).backgroundColor === THEMES[scheme].glass.tint.top,
    );
    expect(fills).toHaveLength(1);
    expect(hostsOfType(root(), "GlassView")).toEqual([]);
  });

  it("tints with the denser stop for the dense variant", async () => {
    await renderSurface(BLUR_RENDERER, { variant: "dense" });

    const fills = hostsOf(root()).filter(
      (host) =>
        styleOf(host).backgroundColor === lightTheme.glass.tint.denseTop,
    );
    expect(fills).toHaveLength(1);
  });

  it("keeps the surface radius and shadow, and paints nothing itself", async () => {
    await renderSurface(BLUR_RENDERER);

    expect(styleOf(root())).toMatchObject({
      borderRadius: lightTheme.radius.surface,
      ...lightTheme.glass.shadow.glass,
    });
    expect(styleOf(root())).not.toHaveProperty("backgroundColor");
  });
});

describe("GlassSurface solid fallback", () => {
  it.each(SCHEMES)("paints the opaque %s tokens", async (scheme) => {
    await renderSurface(NO_RENDERER, {}, { colorScheme: scheme });

    const { glass, radius } = THEMES[scheme];
    expect(styleOf(root())).toMatchObject({
      backgroundColor: glass.solid.tint.top,
      borderColor: glass.solid.hairline,
      borderRadius: radius.surface,
      borderWidth: 1,
      ...glass.solid.shadow.glass,
    });
    expect(hostsOf(root())).toHaveLength(1);
  });

  it("uses the solid dense tint and the solid floating shadow", async () => {
    await renderSurface(NO_RENDERER, { elevated: true, variant: "dense" });

    expect(styleOf(root())).toMatchObject({
      backgroundColor: lightTheme.glass.solid.tint.denseTop,
      ...lightTheme.glass.solid.shadow.glassFloating,
    });
  });

  type Reason = {
    readonly name: string;
    readonly options: RenderOptions;
    readonly props: GlassSurfaceProps;
    readonly renderer: GlassRenderer;
  };

  const reasons: readonly Reason[] = [
    {
      name: "material is solid",
      options: {},
      props: { material: "solid" },
      renderer: GLASS_RENDERER,
    },
    {
      name: "Reduce Transparency is on",
      options: { state: { reduceTransparency: true } },
      props: {},
      renderer: GLASS_RENDERER,
    },
    {
      name: "Increase Contrast is on",
      options: { state: { darkerSystemColors: true } },
      props: {},
      renderer: GLASS_RENDERER,
    },
    {
      name: "High Text Contrast is on",
      options: { state: { highTextContrast: true } },
      props: {},
      renderer: GLASS_RENDERER,
    },
    {
      name: "the global switch is off",
      options: { glass: false },
      props: {},
      renderer: GLASS_RENDERER,
    },
    {
      name: "the platform has not answered yet",
      options: { state: { reduceTransparency: "pending" } },
      props: {},
      renderer: GLASS_RENDERER,
    },
    {
      name: "neither peer is installed",
      options: {},
      props: {},
      renderer: NO_RENDERER,
    },
  ];

  it.each(reasons)(
    "draws solid when $name",
    async ({ options, props, renderer }) => {
      await renderSurface(renderer, props, options);

      expect(styleOf(root()).backgroundColor).toBe(
        lightTheme.glass.solid.tint.top,
      );
      expect(hostsOfType(root(), "GlassView")).toEqual([]);
      expect(hostsOfType(root(), "BlurView")).toEqual([]);
    },
  );

  it("draws solid outside a ThemeProvider, where nothing observes the platform", async () => {
    mockedRenderer.mockReturnValue(GLASS_RENDERER);
    render(<GlassSurface testID="surface" />);
    await settlePreferences();

    expect(styleOf(root()).backgroundColor).toBe(
      lightTheme.glass.solid.tint.top,
    );
    expect(hostsOfType(root(), "GlassView")).toEqual([]);
  });

  it.each(PREFERENCES)(
    "swaps to solid and back as %s flips",
    async (preference) => {
      const { fake } = await renderSurface(GLASS_RENDERER);
      expect(hostsOfType(root(), "GlassView")).toHaveLength(1);

      await change(() => {
        fake[preference].emit(true);
      });
      expect(hostsOfType(root(), "GlassView")).toEqual([]);
      expect(styleOf(root()).backgroundColor).toBe(
        lightTheme.glass.solid.tint.top,
      );

      await change(() => {
        fake[preference].emit(false);
      });
      expect(hostsOfType(root(), "GlassView")).toHaveLength(1);
      expect(styleOf(root())).not.toHaveProperty("backgroundColor");
    },
  );

  it("swaps a blur surface to solid when Reduce Transparency turns on", async () => {
    const { fake } = await renderSurface(BLUR_RENDERER);
    expect(hostsOfType(root(), "BlurView")).toHaveLength(1);

    await change(() => {
      fake.reduceTransparency.emit(true);
    });

    expect(hostsOfType(root(), "BlurView")).toEqual([]);
  });
});

describe("GlassSurface subscriptions", () => {
  const surfaceIds = Array.from(
    { length: 20 },
    (_unused, index) => `surface-${index}`,
  );
  const surfaces = surfaceIds.map((id) => (
    <GlassSurface key={id} testID={id} />
  ));

  it("creates one set of listeners for 20 surfaces under one provider", async () => {
    const fake = fakeService();
    mockedRenderer.mockReturnValue(GLASS_RENDERER);

    render(<GlassHarness fake={fake}>{surfaces}</GlassHarness>);
    await settlePreferences();

    expect(hostsOfType(screen.toJSON(), "GlassView")).toHaveLength(20);
    for (const preference of PREFERENCES) {
      expect(fake[preference].subscribeCount()).toBe(1);
      expect(fake[preference].listenerCount()).toBe(1);
    }
  });

  it("reaches all 20 surfaces through that one set of listeners", async () => {
    const fake = fakeService();
    mockedRenderer.mockReturnValue(GLASS_RENDERER);
    render(<GlassHarness fake={fake}>{surfaces}</GlassHarness>);
    await settlePreferences();

    await change(() => {
      fake.reduceTransparency.emit(true);
    });
    expect(hostsOfType(screen.toJSON(), "GlassView")).toEqual([]);

    await change(() => {
      fake.reduceTransparency.emit(false);
    });
    expect(hostsOfType(screen.toJSON(), "GlassView")).toHaveLength(20);
  });

  it("subscribes AccessibilityInfo once for nested ThemeProviders with 20 surfaces", () => {
    const addEventListener = jest.spyOn(AccessibilityInfo, "addEventListener");
    addEventListener.mockClear();
    mockedRenderer.mockReturnValue(GLASS_RENDERER);

    render(
      <ThemeProvider colorScheme="light">
        <ThemeProvider colorScheme="dark">{surfaces}</ThemeProvider>
      </ThemeProvider>,
    );

    const calls: readonly (readonly unknown[])[] = addEventListener.mock.calls;
    const eventNames = calls.map(([eventName]) => eventName);
    expect(eventNames).toHaveLength(3);
    expect(eventNames).toEqual(
      expect.arrayContaining([
        "darkerSystemColorsChanged",
        "highTextContrastChanged",
        "reduceTransparencyChanged",
      ]),
    );
  });
});

describe("GlassSurface as a static container", () => {
  const handlers = [
    "onClick",
    "onLongPress",
    "onPress",
    "onPressIn",
    "onPressOut",
    "onResponderRelease",
    "onStartShouldSetResponder",
  ] as const;
  const accessibleKeys = [
    "accessibilityRole",
    "accessible",
    "focusable",
    "role",
  ] as const;

  it.each<readonly [string, GlassRenderer]>([
    ["Liquid Glass", GLASS_RENDERER],
    ["blur", BLUR_RENDERER],
    ["solid", NO_RENDERER],
  ])(
    "adds no press handler, role or focus target under %s",
    async (_name, renderer) => {
      await renderSurface(renderer);

      for (const host of hostsOf(root())) {
        expect(handlers.filter((key) => host.props[key] !== undefined)).toEqual(
          [],
        );
      }
      expect(
        accessibleKeys.filter((key) => root().props[key] !== undefined),
      ).toEqual([]);
    },
  );

  it("renders its children after the decorative layers", async () => {
    await renderSurface(GLASS_RENDERER, { children: <Text>Inside</Text> });

    const children = childrenOf(root());
    expect(children).toHaveLength(3);
    expect(children[2]).toMatchObject({ children: ["Inside"], type: "Text" });
  });

  it("renders only its children when it draws solid", async () => {
    await renderSurface(NO_RENDERER, { children: <Text>Inside</Text> });

    expect(childrenOf(root())).toHaveLength(1);
  });

  it("forwards View props and the ref to its container", async () => {
    const ref = createRef<View>();
    await renderSurface(GLASS_RENDERER, {
      accessibilityLabel: "Dock",
      ref,
    });

    expect(root().props).toMatchObject({
      accessibilityLabel: "Dock",
      testID: "surface",
    });
    expect(ref.current).not.toBeNull();
  });
});

describe("nested GlassSurface", () => {
  it("draws solid inside a solid surface, even when glass is available", async () => {
    await renderSurface(GLASS_RENDERER, {
      children: <GlassSurface testID="inner" />,
      material: "solid",
    });

    expect(styleOf(byTestId(root(), "inner")).backgroundColor).toBe(
      lightTheme.glass.solid.tint.top,
    );
    expect(hostsOfType(root(), "GlassView")).toEqual([]);
  });

  it("keeps glass on both levels of a glass surface", async () => {
    await renderSurface(GLASS_RENDERER, { children: <GlassSurface /> });

    expect(hostsOfType(root(), "GlassView")).toHaveLength(2);
  });

  it("draws a solid child inside a glass parent as solid", async () => {
    await renderSurface(GLASS_RENDERER, {
      children: <GlassSurface material="solid" testID="inner" />,
    });

    expect(hostsOfType(root(), "GlassView")).toHaveLength(1);
    expect(styleOf(byTestId(root(), "inner")).backgroundColor).toBe(
      lightTheme.glass.solid.tint.top,
    );
  });
});

type TextColorCase = {
  readonly expected: { readonly muted: string; readonly text: string };
  readonly props?: GlassSurfaceProps;
  readonly renderer: GlassRenderer;
  readonly scheme: "dark" | "light";
};

async function expectTextColors({
  expected,
  props = {},
  renderer,
  scheme,
}: TextColorCase) {
  const fake = fakeService();
  mockedRenderer.mockReturnValue(renderer);
  function wrapper({ children }: { readonly children: ReactNode }) {
    return (
      <GlassHarness colorScheme={scheme} fake={fake}>
        <GlassSurface {...props}>{children}</GlassSurface>
      </GlassHarness>
    );
  }
  const { result } = renderHook(
    () => ({
      muted: useGlassTextColor("muted"),
      text: useGlassTextColor("default"),
    }),
    { wrapper },
  );
  await settlePreferences();

  expect(result.current).toEqual(expected);
}

describe("useGlassTextColor", () => {
  it("is undefined outside a surface, so the caller keeps its own color", () => {
    const { result } = renderHook(() => ({
      muted: useGlassTextColor("muted"),
      text: useGlassTextColor("default"),
    }));

    expect(result.current).toEqual({ muted: undefined, text: undefined });
  });

  it.each(SCHEMES)(
    "gives the %s glass colors while glass draws",
    async (scheme) => {
      await expectTextColors({
        expected: {
          muted: THEMES[scheme].glass.mutedForeground,
          text: THEMES[scheme].glass.foreground,
        },
        renderer: GLASS_RENDERER,
        scheme,
      });
    },
  );

  it.each(SCHEMES)(
    "gives the %s solid colors in the fallback",
    async (scheme) => {
      await expectTextColors({
        expected: {
          muted: THEMES[scheme].glass.solid.mutedForeground,
          text: THEMES[scheme].glass.solid.foreground,
        },
        renderer: NO_RENDERER,
        scheme,
      });
    },
  );

  it("follows the drawn material, not the requested one", async () => {
    await expectTextColors({
      expected: {
        muted: lightTheme.glass.solid.mutedForeground,
        text: lightTheme.glass.solid.foreground,
      },
      props: { material: "solid" },
      renderer: GLASS_RENDERER,
      scheme: "light",
    });
  });
});

function expectGlassEnabled(
  expected: boolean,
  nest?: (children: ReactNode) => ReactNode,
) {
  function wrapper({ children }: { readonly children: ReactNode }) {
    return nest === undefined ? children : nest(children);
  }
  const { result } = renderHook(() => useGlassEnabled(), { wrapper });

  expect(result.current).toBe(expected);
}

describe("ThemeProvider glass switch", () => {
  it("is on without a provider", () => {
    expectGlassEnabled(true);
  });

  it("is on in a provider that leaves it unset", () => {
    expectGlassEnabled(true, (children) => (
      <ThemeProvider colorScheme="light">{children}</ThemeProvider>
    ));
  });

  it("turns off with glass={false}", () => {
    expectGlassEnabled(false, (children) => (
      <ThemeProvider colorScheme="light" glass={false}>
        {children}
      </ThemeProvider>
    ));
  });

  it("stays off in a nested provider that leaves it unset", () => {
    expectGlassEnabled(false, (children) => (
      <ThemeProvider glass={false}>
        <ThemeProvider colorScheme="dark">{children}</ThemeProvider>
      </ThemeProvider>
    ));
  });

  it("lets a nested provider turn it back on", () => {
    expectGlassEnabled(true, (children) => (
      <ThemeProvider glass={false}>
        <ThemeProvider glass>{children}</ThemeProvider>
      </ThemeProvider>
    ));
  });
});
