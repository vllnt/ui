import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RangeCalendar } from "./range-calendar";

function findDayButton(buttons: HTMLElement[]): HTMLElement | undefined {
  return buttons.find((button) =>
    /^\d+$/.test(button.textContent?.trim() ?? ""),
  );
}

describe("RangeCalendar", () => {
  describe("rendering", () => {
    it("renders the requested number of months", () => {
      const { getAllByRole } = render(<RangeCalendar numberOfMonths={2} />);

      expect(getAllByRole("grid")).toHaveLength(2);
    });

    it("renders a single month when requested", () => {
      const { getAllByRole } = render(<RangeCalendar numberOfMonths={1} />);

      expect(getAllByRole("grid")).toHaveLength(1);
    });
  });

  describe("selection", () => {
    it("calls onValueChange when a day is picked", () => {
      const onValueChange = vi.fn();
      const { getAllByRole } = render(
        <RangeCalendar numberOfMonths={1} onValueChange={onValueChange} />,
      );

      const dayButton = findDayButton(getAllByRole("button"));
      expect(dayButton).toBeDefined();

      if (dayButton) {
        fireEvent.click(dayButton);
      }

      expect(onValueChange).toHaveBeenCalled();
    });
  });
});
