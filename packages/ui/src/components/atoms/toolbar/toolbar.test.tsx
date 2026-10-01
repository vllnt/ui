import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Toolbar, ToolbarSeparator } from "./toolbar";

function renderToolbar(orientation: "horizontal" | "vertical" = "horizontal") {
  return render(
    <Toolbar aria-label="Actions" orientation={orientation}>
      <button type="button">One</button>
      <button type="button">Two</button>
      <ToolbarSeparator />
      <button type="button">Three</button>
    </Toolbar>,
  );
}

describe("Toolbar", () => {
  it("exposes the toolbar role, orientation, and separator", () => {
    renderToolbar();
    const toolbar = screen.getByRole("toolbar", { name: "Actions" });
    expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Toolbar aria-label="Actions" className="custom-class">
        <button type="button">One</button>
      </Toolbar>,
    );
    expect(screen.getByRole("toolbar")).toHaveClass("custom-class");
  });

  it.each([
    { from: 0, key: "ArrowRight", orientation: "horizontal", to: 1 },
    { from: 1, key: "ArrowLeft", orientation: "horizontal", to: 0 },
    { from: 2, key: "ArrowRight", orientation: "horizontal", to: 0 },
    { from: 0, key: "ArrowDown", orientation: "vertical", to: 1 },
  ] as const)(
    "$orientation: moves focus from control $from on $key to control $to",
    ({ from, key, orientation, to }) => {
      renderToolbar(orientation);
      const buttons = screen.getAllByRole("button");
      buttons[from]?.focus();
      fireEvent.keyDown(screen.getByRole("toolbar"), { key });
      expect(document.activeElement).toBe(buttons[to]);
    },
  );

  it("jumps to the first and last controls on Home and End", () => {
    renderToolbar();
    const buttons = screen.getAllByRole("button");
    buttons[1]?.focus();
    fireEvent.keyDown(screen.getByRole("toolbar"), { key: "End" });
    expect(document.activeElement).toBe(buttons[2]);
    fireEvent.keyDown(screen.getByRole("toolbar"), { key: "Home" });
    expect(document.activeElement).toBe(buttons[0]);
  });
});
