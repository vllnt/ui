import { act, renderHook } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { AccessibilityInfo } from "react-native";

import {
  BLUR_RENDERER,
  fakeService,
  type FakeServiceState,
  GLASS_RENDERER,
  GlassHarness,
  NO_RENDERER,
  type PreferenceAnswer,
  settlePreferences,
} from "../tests/glass-fixtures";
import {
  defaultGlassAccessibilityService,
  GlassAvailabilityProvider,
} from "../theme/glass-availability";
import { ThemeProvider } from "../theme/theme-provider";

import { glassRenderer } from "./glass-peers";
import type { GlassRenderer } from "./glass-renderer";
import { useGlassAvailability } from "./use-glass-availability";

jest.mock("./glass-peers", () => ({ glassRenderer: jest.fn() }));

const mockedRenderer = jest.mocked(glassRenderer);

type Preference =
  | "darkerSystemColors"
  | "highTextContrast"
  | "reduceTransparency";

const PREFERENCES: readonly Preference[] = [
  "darkerSystemColors",
  "highTextContrast",
  "reduceTransparency",
];

/** Every preference off except `preference`, which answers `answer`. */
function only(
  preference: Preference,
  answer: PreferenceAnswer,
): FakeServiceState {
  return {
    darkerSystemColors: preference === "darkerSystemColors" ? answer : false,
    highTextContrast: preference === "highTextContrast" ? answer : false,
    reduceTransparency: preference === "reduceTransparency" ? answer : false,
  };
}

type HookOptions = {
  readonly glass?: boolean;
  /** Skip the wait for the first answers. */
  readonly immediate?: boolean;
  /** What the peers draw with. Defaults to Liquid Glass. */
  readonly renderer?: GlassRenderer;
  readonly state?: FakeServiceState;
};

type ChildrenProps = { readonly children: ReactNode };

/** An app boundary that leaves the platform preferences to `ThemeProvider`. */
function ThemeOnly({ children }: ChildrenProps) {
  return <ThemeProvider colorScheme="light">{children}</ThemeProvider>;
}

/** Renders the hook under the fake platform and, by default, waits for answers. */
async function renderAvailability(options: HookOptions = {}) {
  const fake = fakeService(options.state);
  mockedRenderer.mockReturnValue(options.renderer ?? GLASS_RENDERER);
  function wrapper({ children }: ChildrenProps) {
    return (
      <GlassHarness fake={fake} glass={options.glass}>
        {children}
      </GlassHarness>
    );
  }
  const rendered = renderHook(() => useGlassAvailability(), { wrapper });
  if (options.immediate !== true) await settlePreferences();
  return { fake, ...rendered };
}

async function expectAvailability(
  expected: boolean,
  options?: HookOptions,
): Promise<void> {
  const { result } = await renderAvailability(options);
  expect(result.current).toBe(expected);
}

/** Runs `run` inside `act`, then lets promises settle. */
async function change(run: () => void): Promise<void> {
  await act(async () => {
    run();
    await Promise.resolve();
  });
}

const neverAnswers = () => new Promise<boolean>(() => void 0);

/** Makes the platform answer each preference query, as a device would. */
function answerPlatform(answers: {
  readonly darker: boolean;
  readonly highText: boolean;
  readonly reduce: boolean;
}): void {
  jest
    .spyOn(AccessibilityInfo, "isDarkerSystemColorsEnabled")
    .mockResolvedValue(answers.darker);
  jest
    .spyOn(AccessibilityInfo, "isHighTextContrastEnabled")
    .mockResolvedValue(answers.highText);
  jest
    .spyOn(AccessibilityInfo, "isReduceTransparencyEnabled")
    .mockResolvedValue(answers.reduce);
}

/** Puts the platform queries back to the pending state `jest.setup.cjs` sets. */
function leavePlatformPending(): void {
  jest
    .spyOn(AccessibilityInfo, "isDarkerSystemColorsEnabled")
    .mockImplementation(neverAnswers);
  jest
    .spyOn(AccessibilityInfo, "isHighTextContrastEnabled")
    .mockImplementation(neverAnswers);
  jest
    .spyOn(AccessibilityInfo, "isReduceTransparencyEnabled")
    .mockImplementation(neverAnswers);
}

describe("useGlassAvailability", () => {
  describe("what turns glass on or off", () => {
    it("is on when a peer draws and every preference is off", async () => {
      await expectAvailability(true);
    });

    it("is on with only the blur peer", async () => {
      await expectAvailability(true, { renderer: BLUR_RENDERER });
    });

    it("is off when neither peer is installed", async () => {
      await expectAvailability(false, { renderer: NO_RENDERER });
    });

    it("is off when the global switch on ThemeProvider is off", async () => {
      await expectAvailability(false, { glass: false });
    });

    it.each(PREFERENCES)("is off while %s is on", async (preference) => {
      await expectAvailability(false, { state: only(preference, true) });
    });

    it("is off while every preference is on", async () => {
      await expectAvailability(false, {
        state: {
          darkerSystemColors: true,
          highTextContrast: true,
          reduceTransparency: true,
        },
      });
    });

    it("is off outside a provider, where nothing observes the platform", async () => {
      mockedRenderer.mockReturnValue(GLASS_RENDERER);
      const { result } = renderHook(() => useGlassAvailability());
      await settlePreferences();

      expect(result.current).toBe(false);
    });
  });

  describe("before the platform answers", () => {
    it("is off on the first render", async () => {
      const { result } = await renderAvailability({ immediate: true });
      expect(result.current).toBe(false);

      await settlePreferences();
      expect(result.current).toBe(true);
    });

    it.each(PREFERENCES)(
      "stays off while %s is pending",
      async (preference) => {
        await expectAvailability(false, { state: only(preference, "pending") });
      },
    );

    it("stays off when a query rejects, and a later change still wins", async () => {
      const { fake, result } = await renderAvailability({
        state: only("reduceTransparency", "rejects"),
      });
      expect(result.current).toBe(false);

      await change(() => {
        fake.reduceTransparency.emit(false);
      });
      expect(result.current).toBe(true);
    });

    it("ignores a late answer that an event has already replaced", async () => {
      const { fake, result } = await renderAvailability({
        state: only("reduceTransparency", "pending"),
      });

      await change(() => {
        fake.reduceTransparency.emit(true);
      });
      await change(() => {
        fake.reduceTransparency.settle(false);
      });

      expect(result.current).toBe(false);
    });

    it("takes a pending answer when no event came first", async () => {
      const { fake, result } = await renderAvailability({
        state: only("reduceTransparency", "pending"),
      });
      expect(result.current).toBe(false);

      await change(() => {
        fake.reduceTransparency.settle(false);
      });
      expect(result.current).toBe(true);
    });
  });

  describe("live changes", () => {
    it.each(PREFERENCES)(
      "flips off and back on as %s changes",
      async (preference) => {
        const { fake, result } = await renderAvailability();
        expect(result.current).toBe(true);

        await change(() => {
          fake[preference].emit(true);
        });
        expect(result.current).toBe(false);

        await change(() => {
          fake[preference].emit(false);
        });
        expect(result.current).toBe(true);
      },
    );

    it("stays off until every preference is off again", async () => {
      const { fake, result } = await renderAvailability({
        state: { highTextContrast: true, reduceTransparency: true },
      });

      await change(() => {
        fake.reduceTransparency.emit(false);
      });
      expect(result.current).toBe(false);

      await change(() => {
        fake.highTextContrast.emit(false);
      });
      expect(result.current).toBe(true);
    });
  });

  describe("subscriptions", () => {
    it("subscribes once per preference and removes each on unmount", async () => {
      const { fake, unmount } = await renderAvailability();
      for (const preference of PREFERENCES) {
        expect(fake[preference].listenerCount()).toBe(1);
      }

      unmount();

      for (const preference of PREFERENCES) {
        expect(fake[preference].listenerCount()).toBe(0);
      }
    });

    it("keeps one set of listeners under a nested ThemeProvider", async () => {
      const fake = fakeService();
      mockedRenderer.mockReturnValue(GLASS_RENDERER);
      function wrapper({ children }: ChildrenProps) {
        return (
          <GlassHarness fake={fake}>
            <ThemeProvider colorScheme="dark">{children}</ThemeProvider>
          </GlassHarness>
        );
      }
      const { result } = renderHook(() => useGlassAvailability(), { wrapper });
      await settlePreferences();

      expect(result.current).toBe(true);
      for (const preference of PREFERENCES) {
        expect(fake[preference].subscribeCount()).toBe(1);
      }
    });

    it("moves its subscriptions to a new service", async () => {
      mockedRenderer.mockReturnValue(GLASS_RENDERER);
      const first = fakeService();
      const next = fakeService({ reduceTransparency: true });
      let service = first.service;
      function wrapper({ children }: ChildrenProps) {
        return (
          <GlassAvailabilityProvider service={service}>
            <ThemeProvider colorScheme="light">{children}</ThemeProvider>
          </GlassAvailabilityProvider>
        );
      }
      const { rerender, result } = renderHook(() => useGlassAvailability(), {
        wrapper,
      });
      await settlePreferences();
      expect(result.current).toBe(true);

      service = next.service;
      rerender({});
      await settlePreferences();

      expect(first.reduceTransparency.listenerCount()).toBe(0);
      expect(next.reduceTransparency.listenerCount()).toBe(1);
      expect(result.current).toBe(false);
    });
  });

  describe("the default service", () => {
    afterEach(leavePlatformPending);

    it("forwards each preference to AccessibilityInfo", async () => {
      const addEventListener = jest.spyOn(
        AccessibilityInfo,
        "addEventListener",
      );
      addEventListener.mockClear();
      answerPlatform({ darker: false, highText: true, reduce: false });
      const listener = jest.fn();

      const subscriptions = PREFERENCES.map((preference) =>
        defaultGlassAccessibilityService[preference].addListener(listener),
      );

      expect(addEventListener.mock.calls).toEqual([
        ["darkerSystemColorsChanged", listener],
        ["highTextContrastChanged", listener],
        ["reduceTransparencyChanged", listener],
      ]);
      for (const subscription of subscriptions) {
        subscription.remove();
        expect(subscription.remove).toHaveBeenCalledTimes(1);
      }
      await expect(
        defaultGlassAccessibilityService.darkerSystemColors.isEnabled(),
      ).resolves.toBe(false);
      await expect(
        defaultGlassAccessibilityService.highTextContrast.isEnabled(),
      ).resolves.toBe(true);
      await expect(
        defaultGlassAccessibilityService.reduceTransparency.isEnabled(),
      ).resolves.toBe(false);
    });

    it.each([
      ["on", { darker: false, highText: false, reduce: false }, true],
      ["off", { darker: false, highText: false, reduce: true }, false],
    ] as const)(
      "drives the hook through ThemeProvider alone: glass %s",
      async (_name, answers, expected) => {
        mockedRenderer.mockReturnValue(GLASS_RENDERER);
        answerPlatform(answers);
        const { result } = renderHook(() => useGlassAvailability(), {
          wrapper: ThemeOnly,
        });
        expect(result.current).toBe(false);

        await settlePreferences();

        expect(result.current).toBe(expected);
      },
    );

    it.each([
      "isDarkerSystemColorsEnabled",
      "isHighTextContrastEnabled",
      "isReduceTransparencyEnabled",
    ] as const)(
      "stays off without crashing when %s is missing, as on react-native-web",
      async (query) => {
        mockedRenderer.mockReturnValue(GLASS_RENDERER);
        answerPlatform({ darker: false, highText: false, reduce: false });
        jest.spyOn(AccessibilityInfo, query).mockImplementation(() => {
          throw new TypeError(`AccessibilityInfo.${query} is not a function`);
        });

        const { result } = renderHook(() => useGlassAvailability(), {
          wrapper: ThemeOnly,
        });
        await settlePreferences();

        expect(result.current).toBe(false);
      },
    );

    it("stays off without crashing when the platform cannot subscribe", async () => {
      mockedRenderer.mockReturnValue(GLASS_RENDERER);
      answerPlatform({ darker: false, highText: false, reduce: false });
      const addEventListener = jest
        .spyOn(AccessibilityInfo, "addEventListener")
        .mockImplementation(() => {
          throw new TypeError("unsupported event");
        });

      try {
        const { result, unmount } = renderHook(() => useGlassAvailability(), {
          wrapper: ThemeOnly,
        });
        await settlePreferences();

        expect(result.current).toBe(false);
        unmount();
      } finally {
        addEventListener.mockRestore();
      }
    });
  });
});
