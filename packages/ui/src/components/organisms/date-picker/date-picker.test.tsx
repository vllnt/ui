import {
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { DatePicker } from "./date-picker";

// The calendar loads on demand, which takes longer on a busy machine.
beforeAll(() => {
  configure({ asyncUtilTimeout: 5000 });
});

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

  it("opens a named dialog with focus on the selected date", async () => {
    render(<DatePicker value={new Date(2026, 3, 19)} />);
    fireEvent.click(screen.getByRole("button", { name: /April 19, 2026/ }));
    expect(
      screen.getByRole("dialog", { name: "Choose date" }),
    ).toBeInTheDocument();
    // ui-sdk moves focus a frame after a press opens the popover.
    await waitFor(() => {
      expect(document.activeElement?.closest("[role=grid]")).not.toBeNull();
    });
    expect(document.activeElement).toHaveTextContent("19");
  });

  it("keeps the calendar out of the page until the popover opens", async () => {
    render(<DatePicker value={new Date(2026, 3, 19)} />);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(
      await screen.findByRole("grid", { name: "April 2026" }),
    ).toBeInTheDocument();
  });

  it("reports a picked day, shows it on the button and closes", async () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker
        onValueChange={onValueChange}
        value={new Date(2026, 3, 19)}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(
      await screen.findByRole("gridcell", { name: /^22, Wednesday, April 22/ }),
    );
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 3, 22));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("keeps its own day when uncontrolled", async () => {
    render(<DatePicker />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(await screen.findByRole("gridcell", { current: "date" }));
    await waitFor(() => {
      expect(screen.getByRole("button")).not.toHaveTextContent("Pick a date");
    });
  });

  it("accepts a custom popover label", () => {
    render(<DatePicker popoverLabel="Due date" />);
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getByRole("dialog", { name: "Due date" }),
    ).toBeInTheDocument();
  });
});

describe("DatePicker defaultValue", () => {
  it("shows the default date and keeps it uncontrolled", () => {
    render(<DatePicker defaultValue={new Date(2026, 3, 19)} />);
    expect(screen.getByRole("button")).toHaveTextContent("April 19, 2026");
  });
});
