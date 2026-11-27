import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { GlassPanel } from "./glass-panel";

it("GlassPanel renders children, merges className, and forwards div props", () => {
  const { container } = render(
    <GlassPanel className="custom" data-testid="glass">
      <span>frosted</span>
    </GlassPanel>,
  );
  expect(screen.getByText("frosted")).toBeInTheDocument();
  expect(container.firstChild).toHaveClass("custom");
  expect(container.querySelector("[data-testid='glass']")).toBeInTheDocument();
});

it("GlassPanel is glass by default: the dense tint, data-material glass", () => {
  const { container } = render(<GlassPanel>frosted</GlassPanel>);
  expect(container.firstChild).toHaveAttribute("data-material", "glass");
  expect(container.firstChild).toHaveAttribute("data-glass", "on");
  expect(container.firstChild).toHaveClass("vllnt-glass", "vllnt-glass-dense");
});

it("GlassPanel material=solid sets data-material solid, which turns the glass tokens solid", () => {
  const { container } = render(<GlassPanel material="solid">flat</GlassPanel>);
  expect(container.firstChild).toHaveAttribute("data-material", "solid");
  expect(container.firstChild).not.toHaveAttribute("data-glass");
});
