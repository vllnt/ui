import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Sparkles } from "./sparkles";

describe("Sparkles", () => {
  it("renders its children", () => {
    render(<Sparkles>Magic</Sparkles>);

    expect(screen.getByText("Magic")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <Sparkles className="custom-class">Magic</Sparkles>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders the requested sparkle count", () => {
    const { container } = render(<Sparkles count={5} />);

    expect(container.querySelectorAll("span")).toHaveLength(5);
  });
});
