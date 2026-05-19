import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useControllableState } from "./use-uncontrolled-state";

function Counter({ onChange }: { onChange?: (value: number) => void }) {
  const [value, setValue] = useControllableState({
    defaultValue: 0,
    onChange,
  });

  return (
    <button
      onClick={() => {
        setValue((currentValue) => currentValue + 1);
        setValue((currentValue) => currentValue + 1);
      }}
      type="button"
    >
      {value}
    </button>
  );
}

describe("useControllableState", () => {
  it("applies batched uncontrolled functional updates to the latest state", () => {
    const handleChange = vi.fn();

    render(<Counter onChange={handleChange} />);

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent("2");
    expect(handleChange).toHaveBeenNthCalledWith(1, 1);
    expect(handleChange).toHaveBeenNthCalledWith(2, 2);
  });
});
