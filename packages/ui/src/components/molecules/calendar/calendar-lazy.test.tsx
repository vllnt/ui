import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LazyCalendar } from "./calendar-lazy";

const NOVEMBER = new Date(2026, 10, 1);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 26, 9));
});

afterEach(() => {
  vi.useRealTimers();
});

// The first test renders the calendar before it has loaded. Later tests find
// it loaded already, so this one alone sees the placeholder.
describe("LazyCalendar", () => {
  it("holds the calendar's place with a hidden placeholder of the same size", async () => {
    const { container } = render(
      <LazyCalendar defaultMonth={NOVEMBER} mode="single" />,
    );

    const placeholder = container.firstElementChild;
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(placeholder).toHaveAttribute("aria-hidden", "true");
    expect(placeholder).toHaveClass("p-3");
    const before = {
      cells: container.querySelectorAll("tbody td").length,
      headers: container.querySelectorAll("thead th").length,
      rows: container.querySelectorAll("tbody tr").length,
    };

    // The first import of the calendar module is slow on a busy machine.
    await screen.findByRole(
      "grid",
      { name: "November 2026" },
      { timeout: 15_000 },
    );
    expect(container.firstElementChild).toHaveClass("p-3");
    expect({
      cells: container.querySelectorAll("tbody td").length,
      headers: container.querySelectorAll("thead th").length,
      rows: container.querySelectorAll("tbody tr").length,
    }).toEqual(before);
    expect(before).toEqual({ cells: 35, headers: 7, rows: 5 });
  }, 30_000);

  it.each([
    { fixedWeeks: false, month: new Date(2026, 1, 1), rows: 4 },
    { fixedWeeks: false, month: new Date(2026, 4, 1), rows: 6 },
    { fixedWeeks: true, month: new Date(2026, 1, 1), rows: 6 },
  ])(
    "gives the placeholder the weeks the month needs ($month, fixedWeeks $fixedWeeks)",
    async ({ fixedWeeks, month, rows }) => {
      const { container, unmount } = render(
        <LazyCalendar defaultMonth={month} fixedWeeks={fixedWeeks} />,
      );
      expect(container.querySelectorAll("tbody tr")).toHaveLength(rows);
      await screen.findByRole("grid");
      expect(container.querySelectorAll("tbody tr")).toHaveLength(rows);
      unmount();
    },
  );

  it("gives the placeholder one month per requested month", async () => {
    const { container } = render(
      <LazyCalendar defaultMonth={NOVEMBER} numberOfMonths={2} />,
    );
    expect(container.querySelectorAll("table")).toHaveLength(2);
    await screen.findAllByRole("grid");
    expect(container.querySelectorAll("table")).toHaveLength(2);
  });

  it("passes its props to the calendar", async () => {
    render(<LazyCalendar className="custom-class" defaultMonth={NOVEMBER} />);
    const grid = await screen.findByRole("grid");
    expect(grid.closest("[data-slot=calendar]")).toHaveClass("custom-class");
  });
});
