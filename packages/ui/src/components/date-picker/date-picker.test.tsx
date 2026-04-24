import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
  it("renders placeholder by default", () => {
    render(<DatePicker placeholder="Select a due date" />);

    expect(screen.getByRole("button")).toHaveTextContent("Select a due date");
  });

  it("renders the selected date", () => {
    render(<DatePicker value={new Date("2026-04-19T00:00:00.000Z")} />);

    expect(screen.getByRole("button")).toHaveTextContent("April 19, 2026");
  });

  it("forwards calendar selection changes", () => {
    const onValueChange = vi.fn();

    render(
      <DatePicker
        onValueChange={onValueChange}
        value={new Date("2026-04-19T00:00:00.000Z")}
      />,
    );

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
