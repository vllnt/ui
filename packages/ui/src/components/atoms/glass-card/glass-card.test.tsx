import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { GlassCard } from "./glass-card";

it("GlassCard renders its children and applies a custom class name", () => {
  const { container } = render(
    <GlassCard className="custom-class">Content</GlassCard>,
  );
  expect(screen.getByText("Content")).toBeInTheDocument();
  expect(container.firstChild).toHaveClass("custom-class");
});

it("GlassCard is glass by default and opts out with material=solid", () => {
  const { container, rerender } = render(<GlassCard>Content</GlassCard>);
  expect(container.firstChild).toHaveAttribute("data-material", "glass");
  expect(container.firstChild).toHaveClass("vllnt-glass", "vllnt-glass-dense");
  rerender(<GlassCard material="solid">Content</GlassCard>);
  expect(container.firstChild).toHaveAttribute("data-material", "solid");
});
