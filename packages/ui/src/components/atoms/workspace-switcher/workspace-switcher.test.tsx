import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WorkspaceSwitcher } from "./workspace-switcher";

const workspaces = [
  { description: "Runs and outputs", id: "orchestrate", label: "Orchestrate" },
  { description: "Object neighborhoods", id: "objects", label: "Objects" },
  { description: "Telemetry sweep", id: "signals", label: "Signals" },
];

describe("WorkspaceSwitcher", () => {
  it("selects the first workspace by default", () => {
    render(<WorkspaceSwitcher workspaces={workspaces} />);
    expect(screen.getByRole("radio", { name: "Orchestrate" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("updates internal state when uncontrolled", () => {
    render(<WorkspaceSwitcher workspaces={workspaces} />);
    fireEvent.click(screen.getByRole("radio", { name: "Objects" }));
    expect(screen.getByRole("radio", { name: "Objects" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("calls onValueChange when a workspace is chosen", () => {
    const onValueChange = vi.fn();
    render(
      <WorkspaceSwitcher
        onValueChange={onValueChange}
        workspaces={workspaces}
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Signals" }));
    expect(onValueChange).toHaveBeenCalledWith("signals");
  });

  it("exposes a single tab stop on the checked workspace (APG radio group)", () => {
    render(
      <WorkspaceSwitcher defaultValue="objects" workspaces={workspaces} />,
    );
    const stops = screen
      .getAllByRole("radio")
      .filter((radio) => radio.getAttribute("tabindex") === "0");
    expect(stops).toEqual([screen.getByRole("radio", { name: "Objects" })]);
  });

  it("arrow keys move focus and check the next / previous workspace", () => {
    const onValueChange = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <WorkspaceSwitcher
        onKeyDown={onKeyDown}
        onValueChange={onValueChange}
        workspaces={workspaces}
      />,
    );
    const first = screen.getByRole("radio", { name: "Orchestrate" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    const objects = screen.getByRole("radio", { name: "Objects" });
    expect(objects).toHaveFocus();
    expect(objects).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("objects");
    fireEvent.keyDown(objects, { key: "ArrowLeft" });
    fireEvent.keyDown(first, { key: "ArrowLeft" });
    expect(screen.getByRole("radio", { name: "Signals" })).toHaveFocus();
    expect(onKeyDown).toHaveBeenCalledTimes(3);
  });

  it("respects a controlled value", () => {
    render(<WorkspaceSwitcher value="objects" workspaces={workspaces} />);
    expect(screen.getByRole("radio", { name: "Objects" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
