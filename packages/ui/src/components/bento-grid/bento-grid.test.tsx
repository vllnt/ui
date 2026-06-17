import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BentoCard, BentoGrid } from "./bento-grid";

describe("BentoGrid", () => {
  it("renders its children", () => {
    render(
      <BentoGrid>
        <BentoCard>Tile</BentoCard>
      </BentoGrid>,
    );

    expect(screen.getByText("Tile")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(<BentoGrid className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("BentoCard", () => {
  it("renders its children", () => {
    render(<BentoCard>Card body</BentoCard>);

    expect(screen.getByText("Card body")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(<BentoCard className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
