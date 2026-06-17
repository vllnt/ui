import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TimeField } from "./time-field";

describe("TimeField", () => {
  describe("rendering", () => {
    it("renders a time input", () => {
      const { getByLabelText } = render(<TimeField aria-label="Start time" />);

      expect(getByLabelText("Start time")).toHaveAttribute("type", "time");
    });

    it("reflects the default value", () => {
      const { getByLabelText } = render(
        <TimeField aria-label="Start time" defaultValue="09:30" />,
      );

      expect(getByLabelText("Start time")).toHaveValue("09:30");
    });
  });

  describe("interaction", () => {
    it("calls onValueChange when the value changes", () => {
      const onValueChange = vi.fn();
      const { getByLabelText } = render(
        <TimeField aria-label="Start time" onValueChange={onValueChange} />,
      );

      fireEvent.change(getByLabelText("Start time"), {
        target: { value: "14:45" },
      });

      expect(onValueChange).toHaveBeenCalledWith("14:45");
    });

    it("respects the disabled attribute", () => {
      const { getByLabelText } = render(
        <TimeField aria-label="Start time" disabled />,
      );

      expect(getByLabelText("Start time")).toBeDisabled();
    });
  });
});
