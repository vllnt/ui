import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { LiquidGlass } from "./liquid-glass";

it("LiquidGlass renders its children and applies a custom class name", () => {
  const { container } = render(
    <LiquidGlass className="custom-class">Content</LiquidGlass>,
  );
  expect(screen.getByText("Content")).toBeInTheDocument();
  expect(container.firstChild).toHaveClass("custom-class");
});

it("LiquidGlass keeps the animation name out of inline styles so motion-reduce:animate-none can stop it", () => {
  const { container } = render(<LiquidGlass>Content</LiquidGlass>);
  const sheen = container.querySelector<HTMLElement>("[aria-hidden]");
  expect(sheen?.getAttribute("style") ?? "").not.toMatch(/animation(-name)?:/);
  expect(sheen).toHaveClass("motion-reduce:animate-none");
});

it("LiquidGlass opts into the glass scope by default and not with material=solid", () => {
  const { container, rerender } = render(<LiquidGlass>Content</LiquidGlass>);
  expect(container.firstChild).toHaveAttribute("data-material", "glass");
  expect(container.firstChild).toHaveAttribute("data-glass", "on");
  rerender(<LiquidGlass material="solid">Content</LiquidGlass>);
  expect(container.firstChild).toHaveAttribute("data-material", "solid");
  expect(container.firstChild).not.toHaveAttribute("data-glass");
});
