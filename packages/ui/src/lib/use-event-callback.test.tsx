import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useEventCallback } from "./use-event-callback";

describe("useEventCallback", () => {
  it("keeps one identity and calls the latest closure", () => {
    let value = 1;
    const { rerender, result } = renderHook(
      ({ current }) => useEventCallback(() => current),
      { initialProps: { current: value } },
    );
    const first = result.current;
    value = 2;
    rerender({ current: value });
    expect(result.current).toBe(first);
    expect(first()).toBe(2);
  });

  it("forwards arguments", () => {
    const { result } = renderHook(() =>
      useEventCallback((a: number, b: number) => a + b),
    );
    expect(result.current(2, 3)).toBe(5);
  });
});
