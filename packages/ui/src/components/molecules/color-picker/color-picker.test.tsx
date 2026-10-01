import { fireEvent, render, screen } from "@testing-library/react";
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

  it("names its popover dialog, overridable with popoverLabel", () => {
    const { unmount } = render(<ColorPicker />);
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getByRole("dialog", { name: "Choose colour" }),
    ).toBeInTheDocument();
    unmount();

    render(<ColorPicker popoverLabel="Brand colour" />);
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getByRole("dialog", { name: "Brand colour" }),
    ).toBeInTheDocument();
  });
});
