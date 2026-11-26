import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useControllableState } from "./use-controllable-state";

describe("useControllableState", () => {
  it("holds the state itself and reports each real change", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: "a", onChange }),
    );
    expect(result.current[0]).toBe("a");

    act(() => {
      result.current[1]("b");
    });
    expect(result.current[0]).toBe("b");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("b");
  });

  it("skips a value equal to the current one", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: "a", onChange }),
    );
    act(() => {
      result.current[1]("a");
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("follows `value` when controlled and leaves the update to the parent", () => {
    const onChange = vi.fn();
    const { rerender, result } = renderHook(
      ({ value }) =>
        useControllableState({ defaultValue: "a", onChange, value }),
      { initialProps: { value: "x" } },
    );
    expect(result.current[0]).toBe("x");

    act(() => {
      result.current[1]("y");
    });
    expect(onChange).toHaveBeenCalledExactlyOnceWith("y");
    expect(result.current[0]).toBe("x");

    rerender({ value: "y" });
    expect(result.current[0]).toBe("y");
  });

  it("treats a controlled null as a value, not as uncontrolled", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<null | string>({
        defaultValue: "a",
        onChange,
        value: null,
      }),
    );
    expect(result.current[0]).toBeNull();

    act(() => {
      result.current[1](null);
    });
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      result.current[1]("b");
    });
    expect(onChange).toHaveBeenCalledExactlyOnceWith("b");
    expect(result.current[0]).toBeNull();
  });

  it("keeps one setter identity and calls the latest onChange", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender, result } = renderHook(
      ({ onChange }) => useControllableState({ defaultValue: 0, onChange }),
      { initialProps: { onChange: first } },
    );
    const setter = result.current[1];
    rerender({ onChange: second });
    expect(result.current[1]).toBe(setter);

    act(() => {
      setter(1);
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledExactlyOnceWith(1);
  });
});
