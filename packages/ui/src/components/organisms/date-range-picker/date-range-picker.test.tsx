import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DateRangePicker } from "./date-range-picker";

describe("DateRangePicker", () => {
  it("renders the placeholder by default", () => {
    render(<DateRangePicker placeholder="Choose dates" />);
    expect(screen.getByRole("button")).toHaveTextContent("Choose dates");
  });

  it("renders a formatted range when a value is set", () => {
    render(
      <DateRangePicker
        value={{ from: new Date(2026, 5, 1), to: new Date(2026, 5, 5) }}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Jun 1, 2026");
    expect(screen.getByRole("button")).toHaveTextContent("Jun 5, 2026");
  });

  it("renders only the start date when the range is incomplete", () => {
    render(
      <DateRangePicker value={{ from: new Date(2026, 5, 1), to: undefined }} />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Jun 1, 2026");
  });
});
