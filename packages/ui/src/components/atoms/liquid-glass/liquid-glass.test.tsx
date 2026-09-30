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
