import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
  it("renders placeholder by default", () => {
    render(<DatePicker placeholder="Select a due date" />);
    expect(screen.getByRole("button")).toHaveTextContent("Select a due date");
  });

  it("renders the selected date without firing onValueChange", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker
        onValueChange={onValueChange}
        value={new Date("2026-04-19T00:00:00.000Z")}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("April 19, 2026");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("opens a named dialog with focus on the selected date", () => {
    render(<DatePicker value={new Date(2026, 3, 19)} />);
    fireEvent.click(screen.getByRole("button", { name: /April 19, 2026/ }));
    expect(
      screen.getByRole("dialog", { name: "Choose date" }),
    ).toBeInTheDocument();
    expect(document.activeElement).toHaveTextContent("19");
    expect(document.activeElement?.closest("[role=grid]")).not.toBeNull();
  });

  it("accepts a custom popover label", () => {
    render(<DatePicker popoverLabel="Due date" />);
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getByRole("dialog", { name: "Due date" }),
    ).toBeInTheDocument();
  });
});
