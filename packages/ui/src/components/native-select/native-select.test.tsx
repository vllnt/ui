import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NativeSelect } from "./native-select";

describe("NativeSelect", () => {
  describe("rendering", () => {
    it("renders its options", () => {
      const { getByRole } = render(
        <NativeSelect aria-label="Fruit">
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
        </NativeSelect>,
      );

      expect(getByRole("combobox")).toBeInTheDocument();
    });

    it("applies custom className to the select", () => {
      const { getByRole } = render(
        <NativeSelect aria-label="Fruit" className="custom-class">
          <option value="apple">Apple</option>
        </NativeSelect>,
      );

      expect(getByRole("combobox")).toHaveClass("custom-class");
    });
  });

  describe("selection", () => {
    it("calls onChange when a value is picked", () => {
      const onChange = vi.fn();
      const { getByRole } = render(
        <NativeSelect aria-label="Fruit" onChange={onChange}>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
        </NativeSelect>,
      );

      fireEvent.change(getByRole("combobox"), { target: { value: "banana" } });

      expect(onChange).toHaveBeenCalled();
    });

    it("respects the disabled attribute", () => {
      const { getByRole } = render(
        <NativeSelect aria-label="Fruit" disabled>
          <option value="apple">Apple</option>
        </NativeSelect>,
      );

      expect(getByRole("combobox")).toBeDisabled();
    });
  });
});
