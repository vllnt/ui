import { act } from "@testing-library/react";
import { vi } from "vitest";

/** Manual control over stubbed `requestAnimationFrame` callbacks. */
export type AnimationFrameStub = {
  /** Runs every queued frame callback inside `act`. */
  flush: () => void;
  /** Number of frame callbacks waiting to run. */
  pending: () => number;
};

/**
 * Stubs `requestAnimationFrame` / `cancelAnimationFrame` with a queue that
 * runs when the test calls `flush`, so tests can count frames.
 */
export function stubAnimationFrame(): AnimationFrameStub {
  const callbacks = new Map<number, FrameRequestCallback>();
  let lastId = 0;

  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    lastId += 1;
    callbacks.set(lastId, callback);
    return lastId;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    callbacks.delete(id);
  });

  return {
    flush: () => {
      act(() => {
        const queued = [...callbacks.values()];
        callbacks.clear();
        queued.forEach((callback) => {
          callback(performance.now());
        });
      });
    },
    pending: () => callbacks.size,
  };
}
