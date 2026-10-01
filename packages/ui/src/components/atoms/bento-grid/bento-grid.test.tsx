import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BentoCard, BentoGrid } from "./bento-grid";

describe("BentoGrid", () => {
  it("renders its children and merges className", () => {
    const { container } = render(
      <BentoGrid className="grid-class">
        <BentoCard className="card-class">Tile</BentoCard>
      </BentoGrid>,
    );
    expect(screen.getByText("Tile")).toBeInTheDocument();
    expect(screen.getByText("Tile")).toHaveClass("card-class");
    expect(container.firstChild).toHaveClass("grid-class");
  });
});
