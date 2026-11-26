import { createRef, type ReactNode } from "react";

import { darkTheme, lightTheme } from "@vllnt/ui-core";
import type { View } from "react-native";

import {
  BLUR_ONLY,
  type FakeService,
  fakeService,
  type FakeServiceState,
  type GlassSandbox,
  hostsOf,
  hostsOfType,
  LIQUID_GLASS,
  NO_PEERS,
  type PeerModes,
  type RenderedHost,
  settlePreferences,
  withGlassSandbox,
} from "../tests/glass-fixtures";
import { styleOf } from "../tests/test-utils";

import type { GlassSurfaceProps } from "./glass-surface";

// Each test loads React Native and the test renderer into a fresh registry.
jest.setTimeout(30_000);

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

function rootOf({ testing }: GlassSandbox): RenderedHost {
  return required(hostsOf(testing.screen.toJSON())[0], "rendered root");
}

function byTestId(root: RenderedHost, testID: string): RenderedHost {
  return required(
    hostsOf(root).find((host) => host.props.testID === testID),
    `host ${testID}`,
  );
}

/** The decorative layer that clips the blur or glass view to the corner radius. */
function clipLayer(root: RenderedHost): RenderedHost {
  return required(
    hostsOf(root).find((host) => styleOf(host).overflow === "hidden"),
    "clip layer",
  );
}

/** The decorative overlay that draws the hairline above the blur or glass. */
function hairlineLayer(root: RenderedHost): RenderedHost {
  return required(
    hostsOf(root).find(
      (host) => host !== root && styleOf(host).borderWidth === 1,
    ),
    "hairline layer",
  );
}

/** Renders a surface and waits for the platform preferences to answer. */
async function renderSurface(
  sandbox: GlassSandbox,
  props: GlassSurfaceProps = {},
  options: RenderOptions = {},
) {
  const fake = options.fake ?? fakeService(options.state);
  const { GlassSurface } = sandbox.surface;
  const { ThemeProvider } = sandbox.theme;
  sandbox.testing.render(
    <ThemeProvider
      colorScheme={options.colorScheme ?? "light"}
      glass={options.glass}
    >
      <GlassSurface
        accessibilityService={fake.service}
        testID="surface"
        {...props}
      />
    </ThemeProvider>,
  );
  await settlePreferences(sandbox.testing);
  return { fake, root: () => rootOf(sandbox) };
}

async function change(sandbox: GlassSandbox, run: () => void): Promise<void> {
  await sandbox.testing.act(async () => {
    run();
    await Promise.resolve();
  });
}

describe("GlassSurface with Liquid Glass", () => {
  it.each(SCHEMES)("draws a GlassView with the %s tint", async (scheme) => {
    await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
      const { root } = await renderSurface(
        sandbox,
        {},
        { colorScheme: scheme },
      );

      const [view] = hostsOfType(root(), "GlassView");
      expect(view?.props).toMatchObject({
        colorScheme: scheme,
        glassEffectStyle: "regular",
        tintColor: THEMES[scheme].glass.tint.top,
      });
      expect(hostsOfType(root(), "BlurView")).toEqual([]);
    });
  });

  it("uses the denser tint for the dense variant", async () => {
    await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
      const { root } = await renderSurface(sandbox, { variant: "dense" });

      expect(hostsOfType(root(), "GlassView")[0]?.props.tintColor).toBe(
        lightTheme.glass.tint.denseTop,
      );
    });
  });

  it("leaves the paint to the glass: surface radius and shadow only", async () => {
    await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
      const { root } = await renderSurface(sandbox);

      const style = styleOf(root());
      expect(style).toMatchObject({
        borderRadius: lightTheme.radius.surface,
        ...lightTheme.glass.shadow.glass,
      });
      expect(style).not.toHaveProperty("backgroundColor");
      expect(style).not.toHaveProperty("borderWidth");
    });
  });

  it("raises the shadow when elevated", async () => {
    await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
      const { root } = await renderSurface(sandbox, { elevated: true });

      expect(styleOf(root())).toMatchObject(
        lightTheme.glass.shadow.glassFloating,
      );
    });
  });

  it("draws the hairline above the glass and hides both layers", async () => {
    await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
      const { root } = await renderSurface(sandbox);

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
  });

  it("clips the glass and draws the hairline at the caller's radius", async () => {
    await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
      const { root } = await renderSurface(sandbox, {
        style: { borderRadius: 20, margin: 4 },
      });

      expect(styleOf(root())).toMatchObject({ borderRadius: 20, margin: 4 });
      expect(styleOf(clipLayer(root())).borderRadius).toBe(20);
      expect(styleOf(hairlineLayer(root())).borderRadius).toBe(20);
    });
  });
});

describe("GlassSurface with only expo-blur", () => {
  it.each(SCHEMES)("draws a BlurView for %s over the tint", async (scheme) => {
    await withGlassSandbox(BLUR_ONLY, async (sandbox) => {
      const { root } = await renderSurface(
        sandbox,
        {},
        { colorScheme: scheme },
      );

      const [view] = hostsOfType(root(), "BlurView");
      expect(view?.props).toMatchObject({ intensity: 80, tint: scheme });
      const fills = hostsOf(root()).filter(
        (host) =>
          styleOf(host).backgroundColor === THEMES[scheme].glass.tint.top,
      );
      expect(fills).toHaveLength(1);
      expect(hostsOfType(root(), "GlassView")).toEqual([]);
    });
  });

  it("tints with the denser stop for the dense variant", async () => {
    await withGlassSandbox(BLUR_ONLY, async (sandbox) => {
      const { root } = await renderSurface(sandbox, { variant: "dense" });

      const fills = hostsOf(root()).filter(
        (host) =>
          styleOf(host).backgroundColor === lightTheme.glass.tint.denseTop,
      );
      expect(fills).toHaveLength(1);
    });
  });

  it("keeps the surface radius and shadow, and paints nothing itself", async () => {
    await withGlassSandbox(BLUR_ONLY, async (sandbox) => {
      const { root } = await renderSurface(sandbox);

      expect(styleOf(root())).toMatchObject({
        borderRadius: lightTheme.radius.surface,
        ...lightTheme.glass.shadow.glass,
      });
      expect(styleOf(root())).not.toHaveProperty("backgroundColor");
    });
  });

  it("renders through a forwardRef BlurView", async () => {
    await withGlassSandbox(
      { blur: "forward-ref", glassEffect: "absent" },
      async (sandbox) => {
        const { root } = await renderSurface(sandbox);

        expect(hostsOfType(root(), "BlurView")).toHaveLength(1);
      },
    );
  });
});

describe("GlassSurface solid fallback", () => {
  it.each(SCHEMES)("paints the opaque %s tokens", async (scheme) => {
    await withGlassSandbox(NO_PEERS, async (sandbox) => {
      const { root } = await renderSurface(
        sandbox,
        {},
        { colorScheme: scheme },
      );

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
  });

  it("uses the solid dense tint and the solid floating shadow", async () => {
    await withGlassSandbox(NO_PEERS, async (sandbox) => {
      const { root } = await renderSurface(sandbox, {
        elevated: true,
        variant: "dense",
      });

      expect(styleOf(root())).toMatchObject({
        backgroundColor: lightTheme.glass.solid.tint.denseTop,
        ...lightTheme.glass.solid.shadow.glassFloating,
      });
    });
  });

  const reasons: readonly (readonly [
    string,
    PeerModes,
    GlassSurfaceProps,
    RenderOptions,
  ])[] = [
    ["material is solid", LIQUID_GLASS, { material: "solid" }, {}],
    [
      "Reduce Transparency is on",
      LIQUID_GLASS,
      {},
      { state: { reduceTransparency: true } },
    ],
    [
      "Increase Contrast is on",
      LIQUID_GLASS,
      {},
      { state: { darkerSystemColors: true } },
    ],
    [
      "High Text Contrast is on",
      LIQUID_GLASS,
      {},
      { state: { highTextContrast: true } },
    ],
    ["the global switch is off", LIQUID_GLASS, {}, { glass: false }],
    [
      "the platform has not answered yet",
      LIQUID_GLASS,
      {},
      { state: { reduceTransparency: "pending" } },
    ],
    [
      "the device has no Liquid Glass and expo-blur is missing",
      { blur: "absent", glassEffect: "no-liquid-glass" },
      {},
      {},
    ],
  ];

  it.each(reasons)(
    "draws solid when %s",
    async (_name, modes, props, options) => {
      await withGlassSandbox(modes, async (sandbox) => {
        const { root } = await renderSurface(sandbox, props, options);

        expect(styleOf(root()).backgroundColor).toBe(
          lightTheme.glass.solid.tint.top,
        );
        expect(hostsOfType(root(), "GlassView")).toEqual([]);
        expect(hostsOfType(root(), "BlurView")).toEqual([]);
      });
    },
  );

  it.each(PREFERENCES)(
    "swaps to solid and back as %s flips",
    async (preference) => {
      await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
        const { fake, root } = await renderSurface(sandbox);
        expect(hostsOfType(root(), "GlassView")).toHaveLength(1);

        await change(sandbox, () => {
          fake[preference].emit(true);
        });
        expect(hostsOfType(root(), "GlassView")).toEqual([]);
        expect(styleOf(root()).backgroundColor).toBe(
          lightTheme.glass.solid.tint.top,
        );

        await change(sandbox, () => {
          fake[preference].emit(false);
        });
        expect(hostsOfType(root(), "GlassView")).toHaveLength(1);
        expect(styleOf(root())).not.toHaveProperty("backgroundColor");
      });
    },
  );

  it("swaps a blur surface to solid when Reduce Transparency turns on", async () => {
    await withGlassSandbox(BLUR_ONLY, async (sandbox) => {
      const { fake, root } = await renderSurface(sandbox);
      expect(hostsOfType(root(), "BlurView")).toHaveLength(1);

      await change(sandbox, () => {
        fake.reduceTransparency.emit(true);
      });

      expect(hostsOfType(root(), "BlurView")).toEqual([]);
    });
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

  it.each<readonly [string, PeerModes]>([
    ["Liquid Glass", LIQUID_GLASS],
    ["blur", BLUR_ONLY],
    ["solid", NO_PEERS],
  ])(
    "adds no press handler, role or focus target under %s",
    async (_name, modes) => {
      await withGlassSandbox(modes, async (sandbox) => {
        const { root } = await renderSurface(sandbox);

        for (const host of hostsOf(root())) {
          expect(
            handlers.filter((key) => host.props[key] !== undefined),
          ).toEqual([]);
        }
        expect(
          accessibleKeys.filter((key) => root().props[key] !== undefined),
        ).toEqual([]);
      });
    },
  );

  it("renders its children after the decorative layers", async () => {
    await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
      const { Text } = sandbox.reactNative;
      const { root } = await renderSurface(sandbox, {
        children: <Text>Inside</Text>,
      });

      const { children } = root();
      expect(children).toHaveLength(3);
      expect(children[2]).toMatchObject({ children: ["Inside"], type: "Text" });
    });
  });

  it("renders only its children when it draws solid", async () => {
    await withGlassSandbox(NO_PEERS, async (sandbox) => {
      const { Text } = sandbox.reactNative;
      const { root } = await renderSurface(sandbox, {
        children: <Text>Inside</Text>,
      });

      expect(root().children).toHaveLength(1);
    });
  });

  it("forwards View props and the ref to its container", async () => {
    await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
      const ref = createRef<View>();
      const { root } = await renderSurface(sandbox, {
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
});

describe("nested GlassSurface", () => {
  it("draws solid inside a solid surface, even when glass is available", async () => {
    await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
      const fake = fakeService();
      const { GlassSurface } = sandbox.surface;
      const { root } = await renderSurface(
        sandbox,
        {
          children: (
            <GlassSurface accessibilityService={fake.service} testID="inner" />
          ),
          material: "solid",
        },
        { fake },
      );

      expect(styleOf(byTestId(root(), "inner")).backgroundColor).toBe(
        lightTheme.glass.solid.tint.top,
      );
      expect(hostsOfType(root(), "GlassView")).toEqual([]);
    });
  });

  it("keeps glass on both levels of a glass surface", async () => {
    await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
      const fake = fakeService();
      const { GlassSurface } = sandbox.surface;
      const { root } = await renderSurface(
        sandbox,
        {
          children: <GlassSurface accessibilityService={fake.service} />,
        },
        { fake },
      );

      expect(hostsOfType(root(), "GlassView")).toHaveLength(2);
    });
  });

  it("draws a solid child inside a glass parent as solid", async () => {
    await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
      const fake = fakeService();
      const { GlassSurface } = sandbox.surface;
      const { root } = await renderSurface(
        sandbox,
        {
          children: (
            <GlassSurface
              accessibilityService={fake.service}
              material="solid"
              testID="inner"
            />
          ),
        },
        { fake },
      );

      expect(hostsOfType(root(), "GlassView")).toHaveLength(1);
      expect(styleOf(byTestId(root(), "inner")).backgroundColor).toBe(
        lightTheme.glass.solid.tint.top,
      );
    });
  });
});

describe("useGlassTextColor", () => {
  type Expected = { readonly muted: string; readonly text: string };

  async function expectTextColors(
    modes: PeerModes,
    scheme: "dark" | "light",
    expected: Expected,
    props: GlassSurfaceProps = {},
  ) {
    await withGlassSandbox(modes, async (sandbox) => {
      const fake = fakeService();
      const { GlassSurface, useGlassTextColor } = sandbox.surface;
      const { ThemeProvider } = sandbox.theme;
      function wrapper({ children }: { readonly children: ReactNode }) {
        return (
          <ThemeProvider colorScheme={scheme}>
            <GlassSurface accessibilityService={fake.service} {...props}>
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

      expect(result.current).toEqual(expected);
    });
  }

  it("is undefined outside a surface, so the caller keeps its own color", async () => {
    await withGlassSandbox(LIQUID_GLASS, ({ surface, testing }) => {
      const { result } = testing.renderHook(() => ({
        muted: surface.useGlassTextColor("muted"),
        text: surface.useGlassTextColor("default"),
      }));

      expect(result.current).toEqual({ muted: undefined, text: undefined });
    });
  });

  it.each(SCHEMES)(
    "gives the %s glass colors while glass draws",
    async (scheme) => {
      await expectTextColors(LIQUID_GLASS, scheme, {
        muted: THEMES[scheme].glass.mutedForeground,
        text: THEMES[scheme].glass.foreground,
      });
    },
  );

  it.each(SCHEMES)(
    "gives the %s solid colors in the fallback",
    async (scheme) => {
      await expectTextColors(NO_PEERS, scheme, {
        muted: THEMES[scheme].glass.solid.mutedForeground,
        text: THEMES[scheme].glass.solid.foreground,
      });
    },
  );

  it("follows the drawn material, not the requested one", async () => {
    await expectTextColors(
      LIQUID_GLASS,
      "light",
      {
        muted: lightTheme.glass.solid.mutedForeground,
        text: lightTheme.glass.solid.foreground,
      },
      { material: "solid" },
    );
  });
});

describe("ThemeProvider glass switch", () => {
  async function expectGlassEnabled(
    expected: boolean,
    nest?: (theme: GlassSandbox["theme"], children: ReactNode) => ReactNode,
  ) {
    await withGlassSandbox(NO_PEERS, ({ testing, theme }) => {
      function wrapper({ children }: { readonly children: ReactNode }) {
        return nest === undefined ? children : nest(theme, children);
      }
      const { result } = testing.renderHook(() => theme.useGlassEnabled(), {
        wrapper,
      });

      expect(result.current).toBe(expected);
    });
  }

  it("is on without a provider", async () => {
    await expectGlassEnabled(true);
  });

  it("is on in a provider that leaves it unset", async () => {
    await expectGlassEnabled(true, (theme, children) => (
      <theme.ThemeProvider colorScheme="light">{children}</theme.ThemeProvider>
    ));
  });

  it("turns off with glass={false}", async () => {
    await expectGlassEnabled(false, (theme, children) => (
      <theme.ThemeProvider colorScheme="light" glass={false}>
        {children}
      </theme.ThemeProvider>
    ));
  });

  it("stays off in a nested provider that leaves it unset", async () => {
    await expectGlassEnabled(false, (theme, children) => (
      <theme.ThemeProvider glass={false}>
        <theme.ThemeProvider colorScheme="dark">{children}</theme.ThemeProvider>
      </theme.ThemeProvider>
    ));
  });

  it("lets a nested provider turn it back on", async () => {
    await expectGlassEnabled(true, (theme, children) => (
      <theme.ThemeProvider glass={false}>
        <theme.ThemeProvider glass>{children}</theme.ThemeProvider>
      </theme.ThemeProvider>
    ));
  });
});
