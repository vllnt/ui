import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useControllableState } from "./use-controllable-state";

describe("useControllableState (uncontrolled)", () => {
  it("starts at defaultValue", () => {
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: "a" }),
    );

    expect(result.current[0]).toBe("a");
  });

  it("supports a lazy defaultValue initializer", () => {
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: () => "lazy" }),
    );

    expect(result.current[0]).toBe("lazy");
  });

  it("updates the value through the setter", () => {
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: "a" }),
    );

    act(() => {
      result.current[1]("b");
    });

    expect(result.current[0]).toBe("b");
  });

  it("fires onChange with the next value", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: "a", onChange }),
    );

    act(() => {
      result.current[1]("b");
    });

    expect(onChange).toHaveBeenCalledExactlyOnceWith("b");
  });
});

describe("useControllableState (controlled)", () => {
  it("resolves to the controlled value", () => {
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: "a", value: "c" }),
    );

    expect(result.current[0]).toBe("c");
  });

  it("does not update internally; fires onChange instead", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: "a", onChange, value: "c" }),
    );

    act(() => {
      result.current[1]("b");
    });

    expect(result.current[0]).toBe("c");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("b");
  });

  it("follows the controlled value across re-renders", () => {
    const { rerender, result } = renderHook(
      ({ value }: { value: string }) =>
        useControllableState({ defaultValue: "a", value }),
      { initialProps: { value: "c" } },
    );

    rerender({ value: "d" });

    expect(result.current[0]).toBe("d");
  });

  it("always calls the latest onChange without changing setter identity", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender, result } = renderHook(
      ({ onChange }: { onChange: (next: string) => void }) =>
        useControllableState({ defaultValue: "a", onChange }),
      { initialProps: { onChange: first } },
    );
    const initialSetter = result.current[1];

    rerender({ onChange: second });

    expect(result.current[1]).toBe(initialSetter);

    act(() => {
      result.current[1]("b");
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledExactlyOnceWith("b");
  });
});
