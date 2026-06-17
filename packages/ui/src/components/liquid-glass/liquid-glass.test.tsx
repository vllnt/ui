import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LiquidGlass } from "./liquid-glass";

describe("LiquidGlass", () => {
  it("renders its children", () => {
    render(<LiquidGlass>Content</LiquidGlass>);

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <LiquidGlass className="custom-class">Card</LiquidGlass>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
