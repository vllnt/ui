import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DateField } from "./date-field";

describe("DateField", () => {
  it("renders a date input reflecting the default value", () => {
    render(<DateField aria-label="Birth date" defaultValue="2026-06-17" />);
    const input = screen.getByLabelText("Birth date");
    expect(input).toHaveAttribute("type", "date");
    expect(input).toHaveValue("2026-06-17");
  });

  it("calls onValueChange when the value changes", () => {
    const onValueChange = vi.fn();
    render(<DateField aria-label="Birth date" onValueChange={onValueChange} />);
    fireEvent.change(screen.getByLabelText("Birth date"), {
      target: { value: "2026-12-25" },
    });
    expect(onValueChange).toHaveBeenCalledWith("2026-12-25");
  });

  it("respects the disabled attribute", () => {
    render(<DateField aria-label="Birth date" disabled />);
    expect(screen.getByLabelText("Birth date")).toBeDisabled();
  });
});
