import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Calendar } from "./calendar";

const NOVEMBER = new Date(2026, 10, 1);

/** A day of the month the test shows, by its number, or by its ISO date. */
const day = (date: number | string) => {
  const isoDate =
    typeof date === "number"
      ? `2026-11-${String(date).padStart(2, "0")}`
      : date;
  const cell = document.querySelector<HTMLElement>(
    `[data-value="${isoDate}"]:not([aria-hidden])`,
  );
  if (!cell) {
    throw new Error(`No day ${isoDate} shows.`);
  }
  return cell;
};
const dayNamed = (name: RegExp) => screen.getByRole("gridcell", { name });
const press = (element: Element, key: string, init = {}) =>
  fireEvent.keyDown(element, { key, ...init });
const focused = () => {
  const { activeElement } = document;
  if (!activeElement) {
    throw new Error("Nothing has focus.");
  }
  return activeElement;
};
const expectFocus = async (date: number | string) => {
  await waitFor(() => {
    expect(focused()).toBe(day(date));
  });
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 26, 9));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Calendar", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(<Calendar className="custom-class" />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("shows the default month as a labelled grid with weekday headers", () => {
    render(<Calendar defaultMonth={NOVEMBER} />);
    const grid = screen.getByRole("grid", { name: "November 2026" });
    expect(grid).toBeInTheDocument();
    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toEqual(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]);
    // November 2026 spans five weeks, like react-day-picker showed.
    expect(screen.getAllByRole("row")).toHaveLength(1 + 5);
  });

  it("shows six weeks per month with fixedWeeks", () => {
    render(<Calendar defaultMonth={NOVEMBER} fixedWeeks />);
    expect(screen.getAllByRole("row")).toHaveLength(1 + 6);
  });

  it("follows the weekStartsOn and locale props", () => {
    render(<Calendar defaultMonth={NOVEMBER} locale="fr" weekStartsOn={1} />);
    expect(screen.getByRole("grid", { name: "novembre 2026" })).toBeVisible();
    expect(screen.getAllByRole("columnheader")[0]).toHaveTextContent("lu");
  });

  it("marks today with aria-current", () => {
    render(<Calendar defaultMonth={NOVEMBER} mode="single" />);
    expect(day(26)).toHaveAttribute("aria-current", "date");
    expect(day(25)).not.toHaveAttribute("aria-current");
  });
});

describe("Calendar day names", () => {
  it("starts each day's name with its visible number (WCAG 2.5.3)", () => {
    render(<Calendar defaultMonth={NOVEMBER} mode="single" />);
    expect(dayNamed(/^12, Thursday, November 12, 2026/)).toHaveTextContent(
      "12",
    );
  });

  it("names the days after a locale's own words", () => {
    render(<Calendar defaultMonth={NOVEMBER} locale="fr" mode="single" />);
    expect(dayNamed(/^12, jeudi 12 novembre 2026/)).toBeInTheDocument();
  });
});

describe("Calendar selection", () => {
  it("reports a picked day as a local Date", () => {
    const onSelect = vi.fn();
    render(
      <Calendar defaultMonth={NOVEMBER} mode="single" onSelect={onSelect} />,
    );
    fireEvent.click(day(12));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]).toEqual(new Date(2026, 10, 12));
  });

  it("marks only the selected prop, and does not select by itself", () => {
    const { rerender } = render(
      <Calendar
        defaultMonth={NOVEMBER}
        mode="single"
        onSelect={vi.fn()}
        selected={new Date(2026, 10, 5)}
      />,
    );
    fireEvent.click(day(12));
    expect(day(12)).toHaveAttribute("aria-selected", "false");
    expect(day(5)).toHaveAttribute("aria-selected", "true");

    rerender(
      <Calendar
        defaultMonth={NOVEMBER}
        mode="single"
        onSelect={vi.fn()}
        selected={new Date(2026, 10, 12)}
      />,
    );
    expect(day(12)).toHaveAttribute("aria-selected", "true");
    expect(day(5)).toHaveAttribute("aria-selected", "false");
  });

  it("reports undefined when the selected day is pressed again", () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        mode="single"
        onSelect={onSelect}
        selected={new Date(2026, 10, 5)}
      />,
    );
    fireEvent.click(day(5));
    expect(onSelect).toHaveBeenCalledWith(undefined);
  });

  it("reports every picked day in multiple mode", () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        mode="multiple"
        onSelect={onSelect}
        selected={[new Date(2026, 10, 5)]}
      />,
    );
    fireEvent.click(day(12));
    expect(onSelect).toHaveBeenCalledWith([
      new Date(2026, 10, 5),
      new Date(2026, 10, 12),
    ]);
  });

  it("reports an open range after the first press, then the full range", () => {
    const onSelect = vi.fn();
    render(
      <Calendar defaultMonth={NOVEMBER} mode="range" onSelect={onSelect} />,
    );
    fireEvent.click(day(10));
    expect(onSelect).toHaveBeenLastCalledWith({ from: new Date(2026, 10, 10) });
    fireEvent.click(day(14));
    expect(onSelect).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 10),
      to: new Date(2026, 10, 14),
    });
  });

  it("orders a range picked backwards", () => {
    const onSelect = vi.fn();
    render(
      <Calendar defaultMonth={NOVEMBER} mode="range" onSelect={onSelect} />,
    );
    fireEvent.click(day(14));
    fireEvent.click(day(10));
    expect(onSelect).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 10),
      to: new Date(2026, 10, 14),
    });
  });

  it("marks the start, middle and end of a selected range", () => {
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        mode="range"
        onSelect={vi.fn()}
        selected={{ from: new Date(2026, 10, 10), to: new Date(2026, 10, 12) }}
      />,
    );
    expect(day(10)).toHaveAttribute("data-range-start");
    expect(day(11)).toHaveAttribute("data-range-middle");
    expect(day(12)).toHaveAttribute("data-range-end");
    expect(day(13)).not.toHaveAttribute("aria-selected", "true");
  });

  it("clears an open range with Escape", () => {
    const onSelect = vi.fn();
    render(
      <Calendar defaultMonth={NOVEMBER} mode="range" onSelect={onSelect} />,
    );
    const start = day(10);
    fireEvent.click(start);
    onSelect.mockClear();
    press(start, "Escape");
    expect(onSelect).toHaveBeenCalledWith();
  });

  it("only displays the month without a mode", () => {
    render(<Calendar defaultMonth={NOVEMBER} />);
    fireEvent.click(day(12));
    expect(day(12)).not.toHaveAttribute("aria-selected", "true");
  });
});

describe("Calendar unavailable days", () => {
  it("does not pick days a function disables", () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
        mode="single"
        onSelect={onSelect}
      />,
    );
    expect(day(14)).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(day(14));
    fireEvent.click(day(16));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]).toEqual(new Date(2026, 10, 16));
  });

  it("does not pick listed dates", () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        disabled={[new Date(2026, 10, 3), new Date(2026, 10, 4)]}
        mode="single"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(day(3));
    fireEvent.click(day(4));
    expect(onSelect).not.toHaveBeenCalled();
    expect(day(5)).not.toHaveAttribute("aria-disabled", "true");
  });

  it("disables every day with disabled", () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        disabled
        mode="single"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(day(12));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("does not pick days before fromDate or after toDate", () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        fromDate={new Date(2026, 10, 10)}
        mode="single"
        onSelect={onSelect}
        toDate={new Date(2026, 10, 20)}
      />,
    );
    fireEvent.click(day(9));
    fireEvent.click(day(21));
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(day(10));
    fireEvent.click(day(20));
    expect(onSelect).toHaveBeenCalledTimes(2);
  });
});

describe("Calendar months", () => {
  it("steps with the previous and next buttons and reports the month", () => {
    const onMonthChange = vi.fn();
    render(<Calendar defaultMonth={NOVEMBER} onMonthChange={onMonthChange} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Go to the Next Month" }),
    );
    expect(screen.getByRole("grid", { name: "December 2026" })).toBeVisible();
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 11, 1));
    fireEvent.click(
      screen.getByRole("button", { name: "Go to the Previous Month" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Go to the Previous Month" }),
    );
    expect(screen.getByRole("grid", { name: "October 2026" })).toBeVisible();
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 9, 1));
  });

  it("shows the month it is given and waits for the parent to change it", () => {
    const onMonthChange = vi.fn();
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        month={new Date(2026, 5, 15)}
        onMonthChange={onMonthChange}
      />,
    );
    expect(screen.getByRole("grid", { name: "June 2026" })).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Go to the Next Month" }),
    );
    expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 6, 1));
    expect(screen.getByRole("grid", { name: "June 2026" })).toBeVisible();
  });

  it("shows several months side by side", () => {
    render(<Calendar defaultMonth={NOVEMBER} numberOfMonths={2} />);
    expect(
      screen
        .getAllByRole("grid")
        .map((grid) => grid.getAttribute("aria-label")),
    ).toEqual(["November 2026", "December 2026"]);
  });

  it("hides the repeated days of side-by-side months from screen readers", () => {
    const { container } = render(
      <Calendar defaultMonth={NOVEMBER} numberOfMonths={2} />,
    );
    // Each month shows the days of the other that share its weeks, as
    // react-day-picker did. The month a day belongs to announces it.
    expect(container.querySelectorAll("td[aria-hidden=true]")).toHaveLength(7);
    const announced = screen
      .getAllByRole("gridcell")
      .map((cell) => cell.getAttribute("data-value"));
    expect(new Set(announced).size).toBe(announced.length);
  });

  it("keeps the layout of hidden outside days", () => {
    const { container } = render(
      <Calendar defaultMonth={NOVEMBER} showOutsideDays={false} />,
    );
    // The cells around the month stay as blank cells, so the weeks keep
    // their shape.
    expect(container.querySelectorAll("tbody td")).toHaveLength(5 * 7);
    expect(screen.getAllByRole("gridcell")).toHaveLength(30);
  });

  it("shows outside days by default", () => {
    render(<Calendar defaultMonth={NOVEMBER} />);
    expect(screen.getAllByRole("gridcell")).toHaveLength(5 * 7);
  });
});

describe("Calendar keyboard", () => {
  const setup = () => {
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        mode="single"
        onSelect={vi.fn()}
        selected={new Date(2026, 10, 12)}
      />,
    );
    const start = day(12);
    start.focus();
    return start;
  };

  it("keeps one tab stop, on the selected day", () => {
    setup();
    const stops = screen
      .getAllByRole("gridcell")
      .filter((cell) => cell.getAttribute("tabindex") === "0");
    expect(stops).toHaveLength(1);
    expect(stops[0]).toBe(day(12));
  });

  it("moves by a day with the left and right arrows", async () => {
    const start = setup();
    press(start, "ArrowRight");
    await expectFocus(13);
    press(focused(), "ArrowLeft");
    await expectFocus(12);
    press(focused(), "ArrowLeft");
    await expectFocus(11);
  });

  it("moves by a week with the up and down arrows", async () => {
    const start = setup();
    press(start, "ArrowDown");
    await expectFocus(19);
    press(focused(), "ArrowUp");
    await expectFocus(12);
    press(focused(), "ArrowUp");
    await expectFocus(5);
  });

  it("moves to the start and end of the week with Home and End", async () => {
    const start = setup();
    press(start, "Home");
    await expectFocus(8);
    press(focused(), "End");
    await expectFocus(14);
  });

  it("moves by a month with Page Up and Page Down", async () => {
    const start = setup();
    press(start, "PageDown");
    await waitFor(() => {
      expect(screen.getByRole("grid", { name: "December 2026" })).toBeVisible();
    });
    await expectFocus("2026-12-12");
    press(focused(), "PageUp");
    await expectFocus("2026-11-12");
    press(focused(), "PageUp");
    await waitFor(() => {
      expect(screen.getByRole("grid", { name: "October 2026" })).toBeVisible();
    });
    await expectFocus("2026-10-12");
  });

  it("moves by a year with Shift and Page Up or Page Down", async () => {
    const start = setup();
    press(start, "PageDown", { shiftKey: true });
    await waitFor(() => {
      expect(screen.getByRole("grid", { name: "November 2027" })).toBeVisible();
    });
    press(focused(), "PageUp", { shiftKey: true });
    await waitFor(() => {
      expect(screen.getByRole("grid", { name: "November 2026" })).toBeVisible();
    });
  });

  it("carries the arrows into the next month", async () => {
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        mode="single"
        onSelect={vi.fn()}
        selected={new Date(2026, 10, 30)}
      />,
    );
    const last = day(30);
    last.focus();
    press(last, "ArrowRight");
    await waitFor(() => {
      expect(screen.getByRole("grid", { name: "December 2026" })).toBeVisible();
    });
    await expectFocus("2026-12-01");
  });

  it("does not move past fromDate and toDate", async () => {
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        fromDate={new Date(2026, 10, 10)}
        mode="single"
        onSelect={vi.fn()}
        selected={new Date(2026, 10, 12)}
        toDate={new Date(2026, 10, 20)}
      />,
    );
    const start = day(12);
    start.focus();
    press(start, "PageDown");
    await expectFocus(20);
  });

  it("picks the focused day with Enter and with Space", () => {
    const onSelect = vi.fn();
    render(
      <Calendar defaultMonth={NOVEMBER} mode="single" onSelect={onSelect} />,
    );
    const target = day(12);
    target.focus();
    press(target, "Enter");
    press(target, " ");
    expect(onSelect.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(onSelect.mock.calls[0]?.[0]).toEqual(new Date(2026, 10, 12));
  });

  it("puts the tab stop on today when nothing is selected", async () => {
    render(<Calendar defaultMonth={NOVEMBER} mode="single" />);
    await waitFor(() => {
      expect(day(26)).toHaveAttribute("tabindex", "0");
    });
  });
});

describe("Calendar initialFocus", () => {
  it("focuses the selected day once it shows", async () => {
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        initialFocus
        mode="single"
        onSelect={vi.fn()}
        selected={new Date(2026, 10, 12)}
      />,
    );
    await waitFor(() => {
      expect(focused()).toBe(day(12));
    });
  });

  it("does not move focus without it", () => {
    render(
      <Calendar
        defaultMonth={NOVEMBER}
        mode="single"
        selected={new Date(2026, 10, 12)}
      />,
    );
    expect(focused()).toBe(document.body);
  });
});
