import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactElement } from "react";

import type { ReducedMotionService } from "../primitives/use-reduced-motion";
import { ThemeProvider, type ThemeSelection } from "../theme/theme-provider";

export { codePreviewTabs, gridListOptions, searchLabels } from "./fixture-data";

const ignoreSettlement = () => void 0;

/** Wraps an element in the light theme. */
export function themed(element: ReactElement) {
  return <ThemeProvider colorScheme="light">{element}</ThemeProvider>;
}

/** Renders an element inside a `ThemeProvider` (light unless specified). */
export function renderThemed(
  element: ReactElement,
  colorScheme: ThemeSelection = "light",
) {
  return render(
    <ThemeProvider colorScheme={colorScheme}>{element}</ThemeProvider>,
  );
}

/** Promise whose settlement the test controls. */
export function deferred<T = void>() {
  let resolve: (value: T) => void = ignoreSettlement;
  let reject: (error: unknown) => void = ignoreSettlement;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return {
    promise,
    reject,
    /** Rejects inside an async `act` so the resulting updates flush. */
    async rejectInAct(error: unknown) {
      await act(async () => {
        reject(error);
      });
    },
    resolve,
    /** Resolves inside an async `act` so the resulting updates flush. */
    async resolveInAct(value: T) {
      await act(async () => {
        resolve(value);
      });
    },
  };
}

/**
 * Reduced-motion service fake that resolves `preference`, or never settles
 * for `"pending"`.
 */
export function reducedMotion(
  preference: "pending" | boolean,
): ReducedMotionService {
  return {
    addEventListener: () => ({ remove: jest.fn() }),
    isReduceMotionEnabled:
      preference === "pending"
        ? () => new Promise(() => void 0)
        : async () => preference,
  };
}

/** Lets already-queued promise callbacks settle inside `act`. */
export async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
  });
}

/** Advances Jest fake timers by `milliseconds` inside `act`. */
export function advanceTimers(milliseconds: number) {
  act(() => {
    jest.advanceTimersByTime(milliseconds);
  });
}

/** Presses the named button twice within one `act`. */
export function pressTwice(name: string) {
  const button = screen.getByRole("button", { name });
  act(() => {
    fireEvent.press(button);
    fireEvent.press(button);
  });
}
