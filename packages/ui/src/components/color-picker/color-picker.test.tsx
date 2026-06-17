import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ColorPicker } from "./color-picker";

describe("ColorPicker", () => {
  describe("rendering", () => {
    it("renders the default value on the trigger", () => {
      const { getByRole } = render(<ColorPicker />);

      expect(getByRole("button")).toHaveTextContent("#3b82f6");
    });

    it("renders a controlled value", () => {
      const { getByRole } = render(<ColorPicker value="#22c55e" />);

      expect(getByRole("button")).toHaveTextContent("#22c55e");
    });

    it("renders a custom default value", () => {
      const { getByRole } = render(<ColorPicker defaultValue="#ec4899" />);

      expect(getByRole("button")).toHaveTextContent("#ec4899");
    });
  });

  describe("interaction", () => {
    it("does not call onValueChange before any input", () => {
      const onValueChange = vi.fn();
      render(<ColorPicker onValueChange={onValueChange} />);

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });
});
