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

  it("respects a controlled value", () => {
    render(<WorkspaceSwitcher value="objects" workspaces={workspaces} />);

    expect(screen.getByRole("radio", { name: "Objects" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
