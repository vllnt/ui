import type * as TestingLibrary from "@testing-library/react-native/pure";
import type * as ReactModule from "react";
import type * as ReactNativeModule from "react-native";

import type * as GlassSurfaceModule from "../primitives/glass-surface";
import type * as AvailabilityModule from "../primitives/use-glass-availability";
import type * as ThemeProviderModule from "../theme/theme-provider";

/** How the `expo-glass-effect` peer behaves in a sandbox. */
export type GlassEffectMode =
  | "absent"
  | "api-throws"
  | "available"
  | "liquid-glass-throws"
  | "malformed"
  | "missing-checks"
  | "no-api"
  | "no-liquid-glass";

/** How the `expo-blur` peer behaves in a sandbox. */
export type BlurMode = "absent" | "forward-ref" | "malformed" | "present";

/** Which optional peers a sandbox installs, and how they answer. */
export type PeerModes = {
  readonly blur: BlurMode;
  readonly glassEffect: GlassEffectMode;
};

/** Modules a test loads fresh, wired to one set of fake peers. */
export type GlassSandbox = {
  readonly availability: typeof AvailabilityModule;
  readonly reactNative: typeof ReactNativeModule;
  readonly surface: typeof GlassSurfaceModule;
  readonly testing: typeof TestingLibrary;
  readonly theme: typeof ThemeProviderModule;
};

const yes = () => true;
const no = () => false;
const throwing = () => {
  throw new Error("The native module is missing");
};

function glassEffectFactory(mode: GlassEffectMode): () => unknown {
  return () => {
    if (mode === "absent") {
      throw new Error("Cannot find module 'expo-glass-effect'");
    }
    const { createElement } = jest.requireActual<typeof ReactModule>("react");
    const GlassView = (props: object) => createElement("GlassView", props);
    const exportsByMode: Record<Exclude<GlassEffectMode, "absent">, unknown> = {
      "api-throws": {
        GlassView,
        isGlassEffectAPIAvailable: throwing,
        isLiquidGlassAvailable: yes,
      },
      available: {
        GlassView,
        isGlassEffectAPIAvailable: yes,
        isLiquidGlassAvailable: yes,
      },
      "liquid-glass-throws": {
        GlassView,
        isGlassEffectAPIAvailable: yes,
        isLiquidGlassAvailable: throwing,
      },
      malformed: {},
      "missing-checks": { GlassView },
      "no-api": {
        GlassView,
        isGlassEffectAPIAvailable: no,
        isLiquidGlassAvailable: yes,
      },
      "no-liquid-glass": {
        GlassView,
        isGlassEffectAPIAvailable: yes,
        isLiquidGlassAvailable: no,
      },
    };
    return exportsByMode[mode];
  };
}

function blurFactory(mode: BlurMode): () => unknown {
  return () => {
    if (mode === "absent") {
      throw new Error("Cannot find module 'expo-blur'");
    }
    const { createElement, forwardRef } =
      jest.requireActual<typeof ReactModule>("react");
    const exportsByMode: Record<Exclude<BlurMode, "absent">, unknown> = {
      "forward-ref": {
        BlurView: forwardRef((props: object, ref: unknown) =>
          createElement("BlurView", { ...props, ref }),
        ),
      },
      malformed: { BlurView: 42 },
      present: {
        BlurView: (props: object) => createElement("BlurView", props),
      },
    };
    return exportsByMode[mode];
  };
}

/**
 * Registers the fake peers for the next `require` of `expo-glass-effect` and
 * `expo-blur`. They are virtual, so the tests run with or without the real
 * packages installed. An `absent` peer throws on `require`, like a missing one.
 * The fake views render host elements named `GlassView` and `BlurView` that
 * keep every prop they receive.
 */
export function mockGlassPeers(modes: PeerModes): void {
  jest.doMock("expo-glass-effect", glassEffectFactory(modes.glassEffect), {
    virtual: true,
  });
  jest.doMock("expo-blur", blurFactory(modes.blur), { virtual: true });
}

/** Drops the fake peers so nothing outside a sandbox sees them. */
export function unmockGlassPeers(): void {
  jest.dontMock("expo-glass-effect");
  jest.dontMock("expo-blur");
}

/**
 * Runs `run` with the glass modules loaded fresh against `modes`. The peers are
 * read once when `glass-peers` loads, so each combination needs its own module
 * registry. The sandbox's `react` and `react-native` are not the test file's,
 * so render with `sandbox.testing` and build children from
 * `sandbox.reactNative`.
 */
export async function withGlassSandbox(
  modes: PeerModes,
  run: (sandbox: GlassSandbox) => Promise<void> | void,
): Promise<void> {
  await jest.isolateModulesAsync(async () => {
    mockGlassPeers(modes);
    const testing = jest.requireActual<typeof TestingLibrary>(
      "@testing-library/react-native/pure",
    );
    try {
      await run({
        availability: jest.requireActual<typeof AvailabilityModule>(
          "../primitives/use-glass-availability",
        ),
        reactNative:
          jest.requireActual<typeof ReactNativeModule>("react-native"),
        surface: jest.requireActual<typeof GlassSurfaceModule>(
          "../primitives/glass-surface",
        ),
        testing,
        theme: jest.requireActual<typeof ThemeProviderModule>(
          "../theme/theme-provider",
        ),
      });
    } finally {
      testing.cleanup();
      unmockGlassPeers();
    }
  });
}

/** The peers a device with Liquid Glass and a blur view has. */
export const LIQUID_GLASS: PeerModes = {
  blur: "present",
  glassEffect: "available",
};

/** The peers an app has with only `expo-blur` installed. */
export const BLUR_ONLY: PeerModes = { blur: "present", glassEffect: "absent" };

/** The peers an app has with neither optional package installed. */
export const NO_PEERS: PeerModes = { blur: "absent", glassEffect: "absent" };

type Listener = (enabled: boolean) => void;

/** What a fake preference answers when the platform is asked. */
export type PreferenceAnswer = "pending" | "rejects" | boolean;

/** A fake platform preference the test can flip and inspect. */
export type FakePreference = {
  /** Reports a platform change to every live listener. */
  readonly emit: (enabled: boolean) => void;
  /** Number of listeners subscribed right now. */
  readonly listenerCount: () => number;
  readonly preference: AvailabilityModule.GlassPreference;
  /** Answers a `pending` query. It does nothing for any other answer. */
  readonly settle: (enabled: boolean) => void;
};

/** Preference that answers `answer` when asked and keeps its listeners. */
export function fakePreference(answer: PreferenceAnswer): FakePreference {
  const listeners = new Set<Listener>();
  let settle: (enabled: boolean) => void = () => void 0;
  const pending = new Promise<boolean>((resolve) => {
    settle = resolve;
  });
  const isEnabled = (): Promise<boolean> => {
    if (answer === "pending") return pending;
    if (answer === "rejects") return Promise.reject(new Error("unsupported"));
    return Promise.resolve(answer);
  };
  return {
    emit(enabled) {
      for (const listener of listeners) listener(enabled);
    },
    listenerCount: () => listeners.size,
    preference: {
      addListener(listener) {
        listeners.add(listener);
        return {
          remove() {
            listeners.delete(listener);
          },
        };
      },
      isEnabled,
    },
    settle: (enabled) => {
      settle(enabled);
    },
  };
}

/** Which of the three preferences a fake service turns on. */
export type FakeServiceState = {
  readonly darkerSystemColors?: PreferenceAnswer;
  readonly highTextContrast?: PreferenceAnswer;
  readonly reduceTransparency?: PreferenceAnswer;
};

/** The three fake preferences, each reachable for flips, with the service. */
export type FakeService = {
  readonly darkerSystemColors: FakePreference;
  readonly highTextContrast: FakePreference;
  readonly reduceTransparency: FakePreference;
  readonly service: AvailabilityModule.GlassAccessibilityService;
};

/** Service whose three preferences are off unless `state` says otherwise. */
export function fakeService(state: FakeServiceState = {}): FakeService {
  const darkerSystemColors = fakePreference(state.darkerSystemColors ?? false);
  const highTextContrast = fakePreference(state.highTextContrast ?? false);
  const reduceTransparency = fakePreference(state.reduceTransparency ?? false);
  return {
    darkerSystemColors,
    highTextContrast,
    reduceTransparency,
    service: {
      darkerSystemColors: darkerSystemColors.preference,
      highTextContrast: highTextContrast.preference,
      reduceTransparency: reduceTransparency.preference,
    },
  };
}

/** Lets the three preference queries settle, inside the sandbox's `act`. */
export async function settlePreferences(
  testing: typeof TestingLibrary,
): Promise<void> {
  await testing.act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

/** A rendered host element, as `toJSON` reports it. */
export type RenderedHost = {
  readonly children: readonly (RenderedHost | string)[];
  readonly props: Readonly<Record<string, unknown>>;
  readonly type: string;
};

function isRenderedHost(value: unknown): value is RenderedHost {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof value.type === "string" &&
    "props" in value &&
    "children" in value &&
    Array.isArray(value.children)
  );
}

/** Every host in the rendered tree, parents before children. */
export function hostsOf(node: unknown): readonly RenderedHost[] {
  if (Array.isArray(node)) return node.flatMap(hostsOf);
  return isRenderedHost(node) ? [node, ...node.children.flatMap(hostsOf)] : [];
}

/** The hosts of one `type` in the rendered tree, parents before children. */
export function hostsOfType(
  node: unknown,
  type: string,
): readonly RenderedHost[] {
  return hostsOf(node).filter((host) => host.type === type);
}
