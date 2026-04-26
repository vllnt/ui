import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl, SegmentedControlItem } from "./segmented-control";

function renderSegmentedControl(
  props: React.ComponentProps<typeof SegmentedControl> = {},
) {
  return render(
    <SegmentedControl aria-label="View mode" {...props}>
      <SegmentedControlItem value="overview">Overview</SegmentedControlItem>
      <SegmentedControlItem value="details">Details</SegmentedControlItem>
      <SegmentedControlItem disabled value="settings">
        Settings
      </SegmentedControlItem>
    </SegmentedControl>,
  );
}

describe("SegmentedControl", () => {
  it("supports uncontrolled single selection", () => {
    renderSegmentedControl({ defaultValue: "overview" });

    const overview = screen.getByRole("radio", { name: "Overview" });
    const details = screen.getByRole("radio", { name: "Details" });

    expect(overview).toHaveAttribute("aria-checked", "true");
    expect(details).toHaveAttribute("aria-checked", "false");

    fireEvent.click(details);

    expect(overview).toHaveAttribute("aria-checked", "false");
    expect(details).toHaveAttribute("aria-checked", "true");
  });

  it("supports controlled selection via onValueChange", () => {
    const handleValueChange = vi.fn();

    renderSegmentedControl({
      onValueChange: handleValueChange,
      value: "overview",
    });

    fireEvent.click(screen.getByRole("radio", { name: "Details" }));

    expect(handleValueChange).toHaveBeenCalledWith("details");
    expect(screen.getByRole("radio", { name: "Overview" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("supports keyboard navigation and exposes radio semantics", async () => {
    renderSegmentedControl({ defaultValue: "overview" });

    const group = screen.getByRole("group", { name: "View mode" });
    const overview = screen.getByRole("radio", { name: "Overview" });
    const details = screen.getByRole("radio", { name: "Details" });
    const settings = screen.getByRole("radio", { name: "Settings" });

    await act(async () => {
      overview.focus();
      fireEvent.keyDown(overview, { key: "ArrowRight" });
    });

    expect(group).toBeInTheDocument();
    await waitFor(() => {
      expect(details).toHaveAttribute("tabindex", "0");
    });
    expect(settings).toBeDisabled();
  });

  it("prevents interaction when disabled", () => {
    renderSegmentedControl({ defaultValue: "overview", disabled: true });

    const overview = screen.getByRole("radio", { name: "Overview" });
    const details = screen.getByRole("radio", { name: "Details" });

    fireEvent.click(details);

    expect(overview).toBeDisabled();
    expect(details).toBeDisabled();
    expect(overview).toHaveAttribute("aria-checked", "true");
    expect(details).toHaveAttribute("aria-checked", "false");
  });
});
