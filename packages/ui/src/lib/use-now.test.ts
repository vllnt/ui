import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { normalizeDate, useNow } from "./use-now";

describe("normalizeDate", () => {
  it("clones a Date instance", () => {
    const input = new Date("2026-01-01T00:00:00Z");
    const result = normalizeDate(input);

    expect(result).not.toBe(input);
    expect(result.getTime()).toBe(input.getTime());
  });

  it("parses epoch milliseconds", () => {
    expect(normalizeDate(0).getTime()).toBe(0);
  });

  it("parses a date string", () => {
    expect(normalizeDate("2026-01-01T00:00:00Z").toISOString()).toBe(
      "2026-01-01T00:00:00.000Z",
    );
  });
});

describe("useNow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the pinned time when `now` is provided", () => {
    const { result } = renderHook(() =>
      useNow({ now: "2026-01-01T12:00:00Z" }),
    );

    expect(result.current.toISOString()).toBe("2026-01-01T12:00:00.000Z");
  });

  it("does not tick while pinned", () => {
    const { result } = renderHook(() =>
      useNow({ now: "2026-01-01T12:00:00Z", tickMs: 1000 }),
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.toISOString()).toBe("2026-01-01T12:00:00.000Z");
  });

  it("ticks forward every tickMs while live", () => {
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    const { result } = renderHook(() => useNow({ tickMs: 1000 }));
    const initial = result.current.getTime();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.getTime()).toBe(initial + 3000);
  });

  it("clears the interval on unmount", () => {
    const clearSpy = vi.spyOn(window, "clearInterval");
    const { unmount } = renderHook(() => useNow({ tickMs: 1000 }));

    unmount();

    expect(clearSpy).toHaveBeenCalled();
  });
});
