import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DateField } from "./date-field";

describe("DateField", () => {
  describe("rendering", () => {
    it("renders a date input", () => {
      const { getByLabelText } = render(<DateField aria-label="Birth date" />);

      expect(getByLabelText("Birth date")).toHaveAttribute("type", "date");
    });

    it("reflects the default value", () => {
      const { getByLabelText } = render(
        <DateField aria-label="Birth date" defaultValue="2026-06-17" />,
      );

      expect(getByLabelText("Birth date")).toHaveValue("2026-06-17");
    });
  });

  describe("interaction", () => {
    it("calls onValueChange when the value changes", () => {
      const onValueChange = vi.fn();
      const { getByLabelText } = render(
        <DateField aria-label="Birth date" onValueChange={onValueChange} />,
      );

      fireEvent.change(getByLabelText("Birth date"), {
        target: { value: "2026-12-25" },
      });

      expect(onValueChange).toHaveBeenCalledWith("2026-12-25");
    });

    it("respects the disabled attribute", () => {
      const { getByLabelText } = render(
        <DateField aria-label="Birth date" disabled />,
      );

      expect(getByLabelText("Birth date")).toBeDisabled();
    });
  });
});
