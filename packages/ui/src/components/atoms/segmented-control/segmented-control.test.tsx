import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  SegmentedControl,
  SegmentedControlItem,
  segmentedControlVariants,
} from "./segmented-control";

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

    const group = screen.getByRole("radiogroup", { name: "View mode" });
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

  it("stops the selection transition under reduced motion", () => {
    renderSegmentedControl({ defaultValue: "overview" });

    expect(screen.getByRole("radio", { name: "Overview" })).toHaveClass(
      "transition-all",
      "motion-reduce:transition-none",
    );
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

  it("fills the row with a filled track by default", () => {
    renderSegmentedControl({ defaultValue: "overview" });

    const group = screen.getByRole("radiogroup", { name: "View mode" });

    expect(group).toHaveClass("w-full", "bg-secondary");
    expect(group).not.toHaveClass("w-auto", "border", "bg-transparent");
    expect(screen.getByRole("radio", { name: "Overview" })).toHaveClass(
      "flex-1",
    );
  });

  it("fit hugs the content: root w-auto, items flex-none", () => {
    renderSegmentedControl({ defaultValue: "overview", fit: true });

    const group = screen.getByRole("radiogroup", { name: "View mode" });

    expect(group).toHaveClass("w-auto", "[&>*]:flex-none");
    expect(group).not.toHaveClass("w-full");
    expect(segmentedControlVariants({ fit: true })).not.toContain("w-full");
  });

  it("hairline draws a transparent track with a 1 px input-colour border", () => {
    renderSegmentedControl({ defaultValue: "overview", variant: "hairline" });

    const group = screen.getByRole("radiogroup", { name: "View mode" });

    expect(group).toHaveClass("border", "border-input", "bg-transparent");
    expect(group).not.toHaveClass("bg-secondary");
  });

  it("combines fit and hairline and keeps selection working", () => {
    renderSegmentedControl({
      defaultValue: "overview",
      fit: true,
      variant: "hairline",
    });

    fireEvent.click(screen.getByRole("radio", { name: "Details" }));

    expect(screen.getByRole("radio", { name: "Details" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radiogroup", { name: "View mode" })).toHaveClass(
      "w-auto",
      "border-input",
    );
  });
});

describe("SegmentedControl Radix-compatible behavior", () => {
  it("mirrors the checked state in data-state as on and off", () => {
    renderSegmentedControl({ defaultValue: "overview" });
    const overview = screen.getByRole("radio", { name: "Overview" });
    const details = screen.getByRole("radio", { name: "Details" });
    expect(overview).toHaveAttribute("data-state", "on");
    expect(details).toHaveAttribute("data-state", "off");
    fireEvent.click(details);
    expect(overview).toHaveAttribute("data-state", "off");
    expect(details).toHaveAttribute("data-state", "on");
  });

  it("disables an item natively through its own disabled prop", () => {
    renderSegmentedControl({ defaultValue: "overview" });
    expect(screen.getByRole("radio", { name: "Settings" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Details" })).toBeEnabled();
  });

  it("selects the focused item on Enter", () => {
    const handleChange = vi.fn();
    renderSegmentedControl({
      defaultValue: "overview",
      onValueChange: handleChange,
    });
    const details = screen.getByRole("radio", { name: "Details" });
    details.focus();
    fireEvent.keyDown(details, { key: "Enter" });
    expect(handleChange).toHaveBeenCalledWith("details");
  });

  it("selects the last enabled item on End and the first on Home", () => {
    const handleChange = vi.fn();
    renderSegmentedControl({
      defaultValue: "overview",
      onValueChange: handleChange,
    });
    const overview = screen.getByRole("radio", { name: "Overview" });
    overview.focus();
    fireEvent.keyDown(overview, { key: "End" });
    expect(handleChange).toHaveBeenLastCalledWith("details");
    fireEvent.keyDown(screen.getByRole("radio", { name: "Details" }), {
      key: "Home",
    });
    expect(handleChange).toHaveBeenLastCalledWith("overview");
  });
});
