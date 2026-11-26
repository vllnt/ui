import { createElement, type ReactNode } from "react";

import { act } from "@testing-library/react-native";

import type { GlassRenderer } from "../primitives/glass-renderer";
import {
  type GlassAccessibilityService,
  GlassAvailabilityProvider,
  type GlassPreference,
} from "../theme/glass-availability";
import { ThemeProvider } from "../theme/theme-provider";

/**
 * Fake `GlassView`: a host element named `GlassView` that keeps every prop it
 * receives. Tests give it to a mocked `glass-peers`, never to the real peer.
 */
function FakeGlassView(props: object) {
  return createElement("GlassView", props);
}

/** Fake `BlurView`: a host element named `BlurView` that keeps its props. */
function FakeBlurView(props: object) {
  return createElement("BlurView", props);
}

/** The renderer a device with Liquid Glass gets. */
export const GLASS_RENDERER: GlassRenderer = {
  glassView: FakeGlassView,
  kind: "glass",
};

/** The renderer an app that installs `expo-blur` alone gets. */
export const BLUR_RENDERER: GlassRenderer = {
  blurView: FakeBlurView,
  kind: "blur",
};

/** The renderer an app with neither optional peer gets. */
export const NO_RENDERER: GlassRenderer = { kind: "none" };

type Listener = (enabled: boolean) => void;

/** What a fake preference answers to the platform's query. */
export type PreferenceAnswer = "pending" | "rejects" | boolean;

/** A fake platform preference the test can flip and inspect. */
export type FakePreference = {
  /** Reports a platform change to every live listener. */
  readonly emit: (enabled: boolean) => void;
  /** Number of listeners subscribed right now. */
  readonly listenerCount: () => number;
  readonly preference: GlassPreference;
  /** Answers a `pending` query. It does nothing for any other answer. */
  readonly settle: (enabled: boolean) => void;
  /** Number of listeners ever subscribed, including removed ones. */
  readonly subscribeCount: () => number;
};

const ignoreAnswer = () => void 0;

/** Preference that answers `answer` to a query and keeps its listeners. */
export function fakePreference(answer: PreferenceAnswer): FakePreference {
  const listeners = new Set<Listener>();
  let subscribed = 0;
  let settle: (enabled: boolean) => void = ignoreAnswer;
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
      listeners.forEach((listener) => {
        listener(enabled);
      });
    },
    listenerCount: () => listeners.size,
    preference: {
      addListener(listener) {
        listeners.add(listener);
        subscribed += 1;
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
    subscribeCount: () => subscribed,
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
  readonly service: GlassAccessibilityService;
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

type GlassHarnessProps = {
  readonly children: ReactNode;
  readonly colorScheme?: "dark" | "light";
  readonly fake: FakeService;
  readonly glass?: boolean;
};

/**
 * The app boundary of a glass test: the fake platform preferences, outside a
 * `ThemeProvider`. That provider reuses the outer subscription, as a nested
 * one does in an app.
 */
export function GlassHarness({
  children,
  colorScheme = "light",
  fake,
  glass,
}: GlassHarnessProps) {
  return (
    <GlassAvailabilityProvider service={fake.service}>
      <ThemeProvider colorScheme={colorScheme} glass={glass}>
        {children}
      </ThemeProvider>
    </GlassAvailabilityProvider>
  );
}

/** Lets the three preference queries settle, inside `act`. */
export async function settlePreferences(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

/** The children of a rendered host, in order. */
export type RenderedChildren = readonly (RenderedHost | string)[];

/** A rendered host element, as `toJSON` reports it. */
export type RenderedHost = {
  /** The test renderer reports `null` for a host without children. */
  readonly children: null | RenderedChildren;
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
    (value.children === null || Array.isArray(value.children))
  );
}

/** The children of a rendered host, empty for a leaf. */
export function childrenOf(host: RenderedHost): RenderedChildren {
  return host.children ?? [];
}

/** Every host in the rendered tree, parents before children. */
export function hostsOf(node: unknown): readonly RenderedHost[] {
  if (Array.isArray(node)) return node.flatMap(hostsOf);
  return isRenderedHost(node)
    ? [node, ...childrenOf(node).flatMap(hostsOf)]
    : [];
}

/** The hosts of one `type` in the rendered tree, parents before children. */
export function hostsOfType(
  node: unknown,
  type: string,
): readonly RenderedHost[] {
  return hostsOf(node).filter((host) => host.type === type);
}
