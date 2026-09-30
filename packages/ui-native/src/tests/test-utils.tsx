import { act } from "@testing-library/react-native";
import type { ReactElement } from "react";

import type { ReducedMotionService } from "../primitives/use-reduced-motion";
import { ThemeProvider } from "../theme/theme-provider";

const ignoreSettlement = () => void 0;

/** Wraps an element in the light theme. */
export function themed(element: ReactElement) {
  return <ThemeProvider colorScheme="light">{element}</ThemeProvider>;
}

/** Promise whose settlement the test controls. */
export function deferred<T = void>() {
  let resolve: (value: T) => void = ignoreSettlement;
  let reject: (error: unknown) => void = ignoreSettlement;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
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
