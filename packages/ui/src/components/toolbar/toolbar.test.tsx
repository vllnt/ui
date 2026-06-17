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
  describe("rendering", () => {
    it("exposes the toolbar role and orientation", () => {
      renderToolbar();

      const toolbar = screen.getByRole("toolbar", { name: "Actions" });
      expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("renders a separator", () => {
      renderToolbar();

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
  });

  describe("keyboard navigation", () => {
    it("moves focus to the next control on ArrowRight", () => {
      renderToolbar();
      const buttons = screen.getAllByRole("button");
      buttons[0]?.focus();

      fireEvent.keyDown(screen.getByRole("toolbar"), { key: "ArrowRight" });

      expect(document.activeElement).toBe(buttons[1]);
    });

    it("moves focus to the previous control on ArrowLeft", () => {
      renderToolbar();
      const buttons = screen.getAllByRole("button");
      buttons[1]?.focus();

      fireEvent.keyDown(screen.getByRole("toolbar"), { key: "ArrowLeft" });

      expect(document.activeElement).toBe(buttons[0]);
    });

    it("wraps focus from the last control to the first on ArrowRight", () => {
      renderToolbar();
      const buttons = screen.getAllByRole("button");
      buttons[2]?.focus();

      fireEvent.keyDown(screen.getByRole("toolbar"), { key: "ArrowRight" });

      expect(document.activeElement).toBe(buttons[0]);
    });

    it("jumps to the first and last controls on Home and End", () => {
      renderToolbar();
      const buttons = screen.getAllByRole("button");
      buttons[1]?.focus();

      fireEvent.keyDown(screen.getByRole("toolbar"), { key: "End" });
      expect(document.activeElement).toBe(buttons[2]);

      fireEvent.keyDown(screen.getByRole("toolbar"), { key: "Home" });
      expect(document.activeElement).toBe(buttons[0]);
    });

    it("uses ArrowDown/ArrowUp for vertical orientation", () => {
      renderToolbar("vertical");
      const buttons = screen.getAllByRole("button");
      buttons[0]?.focus();

      fireEvent.keyDown(screen.getByRole("toolbar"), { key: "ArrowDown" });

      expect(document.activeElement).toBe(buttons[1]);
    });
  });
});
