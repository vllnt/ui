import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Calendar } from "./calendar";

describe("Calendar", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(<Calendar className="custom-class" />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("Calendar day names", () => {
  it("starts each day button's name with its visible number (WCAG 2.5.3)", () => {
    render(
      <Calendar
        defaultMonth={new Date(2026, 10, 1)}
        mode="single"
        onSelect={vi.fn()}
      />,
    );
    const day = screen.getByRole("button", {
      name: /^12, Thursday, November 12th, 2026/,
    });
    expect(day).toHaveTextContent("12");
  });

  it("keeps a consumer's own labels", () => {
    render(
      <Calendar
        defaultMonth={new Date(2026, 10, 1)}
        labels={{ labelDayButton: (date) => `Day ${date.getDate()}` }}
        mode="single"
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Day 12" })).toBeInTheDocument();
  });
});
