import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TimePicker } from "./time-picker";

describe("TimePicker", () => {
  it("renders the placeholder by default", () => {
    const { getByRole } = render(<TimePicker placeholder="Choose a time" />);
    expect(getByRole("button")).toHaveTextContent("Choose a time");
  });

  it("renders the selected value", () => {
    const { getByRole } = render(<TimePicker value="09:30" />);
    expect(getByRole("button")).toHaveTextContent("09:30");
  });

  it("renders the default value", () => {
    const { getByRole } = render(<TimePicker defaultValue="14:00" />);
    expect(getByRole("button")).toHaveTextContent("14:00");
  });
});

describe("TimePicker keyboard (WAI-ARIA APG listbox pattern)", () => {
  function openPicker(props: Parameters<typeof TimePicker>[0] = {}) {
    render(<TimePicker defaultValue="09:30" {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /09:30|select time/i }));
    return {
      hours: screen.getByRole("listbox", { name: "Hour" }),
      minutes: screen.getByRole("listbox", { name: "Minute" }),
    };
  }

  it("gives the popover dialog an accessible name", () => {
    openPicker();
    expect(
      screen.getByRole("dialog", { name: "Choose time" }),
    ).toBeInTheDocument();
  });

  it("accepts a custom dialog label", () => {
    openPicker({ dialogLabel: "Meeting start" });
    expect(
      screen.getByRole("dialog", { name: "Meeting start" }),
    ).toBeInTheDocument();
  });

  it("keeps one tab stop per column, on the selected option", () => {
    const { hours, minutes } = openPicker();
    const hourStops = [...hours.querySelectorAll('[tabindex="0"]')];
    const minuteStops = [...minutes.querySelectorAll('[tabindex="0"]')];
    expect(hourStops.map((node) => node.textContent)).toEqual(["09"]);
    expect(minuteStops.map((node) => node.textContent)).toEqual(["30"]);
  });

  it("moves focus to the selected hour when opened", async () => {
    const { hours } = openPicker();
    await waitFor(() => {
      expect(within(hours).getByRole("option", { name: "09" })).toHaveFocus();
    });
  });

  it("arrow keys, Home / End and PageDown move and select within a column", () => {
    const onValueChange = vi.fn();
    const { hours } = openPicker({ onValueChange });
    const hour = (name: string) => within(hours).getByRole("option", { name });
    hour("09").focus();
    fireEvent.keyDown(hour("09"), { key: "ArrowDown" });
    expect(hour("10")).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith("10:30");
    fireEvent.keyDown(hour("10"), { key: "End" });
    expect(hour("23")).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith("23:30");
    fireEvent.keyDown(hour("23"), { key: "Home" });
    fireEvent.keyDown(hour("00"), { key: "PageDown" });
    expect(hour("05")).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith("05:30");
  });
});
