import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ColorPicker } from "./color-picker";

describe("ColorPicker", () => {
  it.each([
    ["the default value", {}, "#3b82f6"],
    ["a controlled value", { value: "#22c55e" }, "#22c55e"],
    ["a custom default value", { defaultValue: "#ec4899" }, "#ec4899"],
  ])("renders %s on the trigger", (_, props, expected) => {
    const { getByRole } = render(<ColorPicker {...props} />);
    expect(getByRole("button")).toHaveTextContent(expected);
  });

  it("does not call onValueChange before any input", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker onValueChange={onValueChange} />);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
