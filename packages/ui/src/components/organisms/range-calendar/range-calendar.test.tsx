import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RangeCalendar } from "./range-calendar";

describe("RangeCalendar", () => {
  it.each([1, 2])("renders %i month grid(s) when requested", (months) => {
    const { getAllByRole } = render(<RangeCalendar numberOfMonths={months} />);
    expect(getAllByRole("grid")).toHaveLength(months);
  });

  it("calls onValueChange when a day is picked", () => {
    const onValueChange = vi.fn();
    const { getAllByRole } = render(
      <RangeCalendar numberOfMonths={1} onValueChange={onValueChange} />,
    );
    const dayButton = getAllByRole("button").find((button) =>
      /^\d+$/.test(button.textContent?.trim() ?? ""),
    );
    expect(dayButton).toBeDefined();
    if (dayButton) {
      fireEvent.click(dayButton);
    }
    expect(onValueChange).toHaveBeenCalled();
  });
});
