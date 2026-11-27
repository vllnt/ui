import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RangeCalendar } from "./range-calendar";

const NOVEMBER = new Date(2026, 10, 1);

const day = (date: string) => {
  const cell = document.querySelector<HTMLElement>(
    `[data-value="${date}"]:not([aria-hidden])`,
  );
  if (!cell) {
    throw new Error(`No day ${date} shows.`);
  }
  return cell;
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 26, 9));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("RangeCalendar", () => {
  it.each([1, 2])("renders %i month grid(s) when requested", (months) => {
    const { getAllByRole } = render(<RangeCalendar numberOfMonths={months} />);
    expect(getAllByRole("grid")).toHaveLength(months);
  });

  it("calls onValueChange when a day is picked", () => {
    const onValueChange = vi.fn();
    render(<RangeCalendar numberOfMonths={1} onValueChange={onValueChange} />);
    const dayCell = screen
      .getAllByRole("gridcell")
      .find((cell) => /^\d+, /.test(cell.getAttribute("aria-label") ?? ""));
    expect(dayCell).toBeDefined();
    if (dayCell) {
      fireEvent.click(dayCell);
    }
    expect(onValueChange).toHaveBeenCalled();
  });

  it("reports an open range, then the full range, and shows it", () => {
    const onValueChange = vi.fn();
    render(
      <RangeCalendar
        defaultValue={{ from: NOVEMBER }}
        numberOfMonths={1}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(day("2026-11-10"));
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 10),
    });
    fireEvent.click(day("2026-11-13"));
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 10),
      to: new Date(2026, 10, 13),
    });
    expect(day("2026-11-10")).toHaveAttribute("data-range-start");
    expect(day("2026-11-11")).toHaveAttribute("data-range-middle");
    expect(day("2026-11-13")).toHaveAttribute("data-range-end");
  });

  it("shows a controlled value and leaves changing it to the parent", () => {
    const onValueChange = vi.fn();
    render(
      <RangeCalendar
        numberOfMonths={1}
        onValueChange={onValueChange}
        value={{ from: new Date(2026, 10, 3), to: new Date(2026, 10, 5) }}
      />,
    );
    expect(day("2026-11-03")).toHaveAttribute("data-range-start");
    expect(day("2026-11-05")).toHaveAttribute("data-range-end");
    fireEvent.click(day("2026-11-20"));
    expect(onValueChange).toHaveBeenCalledWith({
      from: new Date(2026, 10, 20),
    });
  });
});
