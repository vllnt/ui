import type { ReactNode } from "react";

import {
  BLUR_ONLY,
  fakeService,
  type FakeServiceState,
  type GlassSandbox,
  LIQUID_GLASS,
  NO_PEERS,
  type PeerModes,
  type PreferenceAnswer,
  settlePreferences,
  withGlassSandbox,
} from "../tests/glass-fixtures";

// Each test loads React Native and the test renderer into a fresh registry.
jest.setTimeout(30_000);

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
  readonly state?: FakeServiceState;
  /** Pass no service, so the hook reads `AccessibilityInfo`. */
  readonly useDefaultService?: boolean;
};

/** Renders the hook under a `ThemeProvider` and, by default, waits for answers. */
async function renderAvailability(
  { availability, testing, theme }: GlassSandbox,
  options: HookOptions = {},
) {
  const fake = fakeService(options.state);
  function wrapper({ children }: { readonly children: ReactNode }) {
    return (
      <theme.ThemeProvider colorScheme="light" glass={options.glass}>
        {children}
      </theme.ThemeProvider>
    );
  }
  const rendered = testing.renderHook(
    ({ service }) => availability.useGlassAvailability(service),
    {
      initialProps: {
        service: options.useDefaultService === true ? undefined : fake.service,
      },
      wrapper,
    },
  );
  if (options.immediate !== true) await settlePreferences(testing);
  return { fake, ...rendered };
}

function availableWith(modes: PeerModes, options?: HookOptions) {
  return withGlassSandbox(modes, async (sandbox) => {
    const { result } = await renderAvailability(sandbox, options);
    expect(result.current).toBe(true);
  });
}

function unavailableWith(modes: PeerModes, options?: HookOptions) {
  return withGlassSandbox(modes, async (sandbox) => {
    const { result } = await renderAvailability(sandbox, options);
    expect(result.current).toBe(false);
  });
}

/** Runs `change` inside the sandbox's `act`, then lets promises settle. */
async function change(sandbox: GlassSandbox, run: () => void): Promise<void> {
  await sandbox.testing.act(async () => {
    run();
    await Promise.resolve();
  });
}

describe("useGlassAvailability", () => {
  describe("what turns glass on or off", () => {
    it("is on when a peer draws and every preference is off", async () => {
      await availableWith(LIQUID_GLASS);
    });

    it("is on with only the blur peer", async () => {
      await availableWith(BLUR_ONLY);
    });

    it("is on with only the glass effect peer", async () => {
      await availableWith({ blur: "absent", glassEffect: "available" });
    });

    it("is off when neither peer is installed", async () => {
      await unavailableWith(NO_PEERS);
    });

    it("is off when the global switch on ThemeProvider is off", async () => {
      await unavailableWith(LIQUID_GLASS, { glass: false });
    });

    it.each(PREFERENCES)("is off while %s is on", async (preference) => {
      await unavailableWith(LIQUID_GLASS, { state: only(preference, true) });
    });

    it("is off while every preference is on", async () => {
      await unavailableWith(LIQUID_GLASS, {
        state: {
          darkerSystemColors: true,
          highTextContrast: true,
          reduceTransparency: true,
        },
      });
    });
  });

  describe("before the platform answers", () => {
    it("is off on the first render", async () => {
      await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
        const { result } = await renderAvailability(sandbox, {
          immediate: true,
        });
        expect(result.current).toBe(false);

        await settlePreferences(sandbox.testing);
        expect(result.current).toBe(true);
      });
    });

    it.each(PREFERENCES)(
      "stays off while %s is pending",
      async (preference) => {
        await unavailableWith(LIQUID_GLASS, {
          state: only(preference, "pending"),
        });
      },
    );

    it("stays off when a query rejects, and a later change still wins", async () => {
      await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
        const { fake, result } = await renderAvailability(sandbox, {
          state: only("reduceTransparency", "rejects"),
        });
        expect(result.current).toBe(false);

        await change(sandbox, () => {
          fake.reduceTransparency.emit(false);
        });
        expect(result.current).toBe(true);
      });
    });

    it("ignores a late answer that an event has already replaced", async () => {
      await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
        const { fake, result } = await renderAvailability(sandbox, {
          state: only("reduceTransparency", "pending"),
        });

        await change(sandbox, () => {
          fake.reduceTransparency.emit(true);
        });
        await change(sandbox, () => {
          fake.reduceTransparency.settle(false);
        });

        expect(result.current).toBe(false);
      });
    });

    it("takes a pending answer when no event came first", async () => {
      await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
        const { fake, result } = await renderAvailability(sandbox, {
          state: only("reduceTransparency", "pending"),
        });
        expect(result.current).toBe(false);

        await change(sandbox, () => {
          fake.reduceTransparency.settle(false);
        });
        expect(result.current).toBe(true);
      });
    });
  });

  describe("live changes", () => {
    it.each(PREFERENCES)(
      "flips off and back on as %s changes",
      async (preference) => {
        await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
          const { fake, result } = await renderAvailability(sandbox);
          expect(result.current).toBe(true);

          await change(sandbox, () => {
            fake[preference].emit(true);
          });
          expect(result.current).toBe(false);

          await change(sandbox, () => {
            fake[preference].emit(false);
          });
          expect(result.current).toBe(true);
        });
      },
    );

    it("stays off until every preference is off again", async () => {
      await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
        const { fake, result } = await renderAvailability(sandbox, {
          state: { highTextContrast: true, reduceTransparency: true },
        });

        await change(sandbox, () => {
          fake.reduceTransparency.emit(false);
        });
        expect(result.current).toBe(false);

        await change(sandbox, () => {
          fake.highTextContrast.emit(false);
        });
        expect(result.current).toBe(true);
      });
    });
  });

  describe("subscriptions", () => {
    it("subscribes once per preference and removes each on unmount", async () => {
      await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
        const { fake, unmount } = await renderAvailability(sandbox);
        for (const preference of PREFERENCES) {
          expect(fake[preference].listenerCount()).toBe(1);
        }

        unmount();

        for (const preference of PREFERENCES) {
          expect(fake[preference].listenerCount()).toBe(0);
        }
      });
    });

    it("moves its subscriptions to a new service", async () => {
      await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
        const { fake, rerender, result } = await renderAvailability(sandbox);
        const next = fakeService({ reduceTransparency: true });

        rerender({ service: next.service });
        await settlePreferences(sandbox.testing);

        expect(fake.reduceTransparency.listenerCount()).toBe(0);
        expect(next.reduceTransparency.listenerCount()).toBe(1);
        expect(result.current).toBe(false);
      });
    });
  });

  describe("the default service", () => {
    it("forwards each preference to AccessibilityInfo", async () => {
      await withGlassSandbox(
        LIQUID_GLASS,
        async ({ availability, reactNative }) => {
          const remove = jest.fn();
          const addEventListener = jest.fn(() => ({ remove }));
          Object.assign(reactNative.AccessibilityInfo, {
            addEventListener,
            isDarkerSystemColorsEnabled: jest.fn(async () => false),
            isHighTextContrastEnabled: jest.fn(async () => true),
            isReduceTransparencyEnabled: jest.fn(async () => false),
          });
          const service = availability.defaultGlassAccessibilityService;
          const listener = jest.fn();

          const subscriptions = PREFERENCES.map((preference) =>
            service[preference].addListener(listener),
          );

          expect(addEventListener.mock.calls).toEqual([
            ["darkerSystemColorsChanged", listener],
            ["highTextContrastChanged", listener],
            ["reduceTransparencyChanged", listener],
          ]);
          for (const subscription of subscriptions) subscription.remove();
          expect(remove).toHaveBeenCalledTimes(3);
          await expect(service.darkerSystemColors.isEnabled()).resolves.toBe(
            false,
          );
          await expect(service.highTextContrast.isEnabled()).resolves.toBe(
            true,
          );
          await expect(service.reduceTransparency.isEnabled()).resolves.toBe(
            false,
          );
        },
      );
    });

    it("drives the hook when no service is passed", async () => {
      await withGlassSandbox(LIQUID_GLASS, async (sandbox) => {
        Object.assign(sandbox.reactNative.AccessibilityInfo, {
          addEventListener: jest.fn(() => ({ remove: jest.fn() })),
          isDarkerSystemColorsEnabled: jest.fn(async () => false),
          isHighTextContrastEnabled: jest.fn(async () => false),
          isReduceTransparencyEnabled: jest.fn(async () => false),
        });
        const { result } = await renderAvailability(sandbox, {
          useDefaultService: true,
        });

        expect(result.current).toBe(true);
      });
    });
  });
});
