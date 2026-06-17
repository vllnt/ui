import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShinyButton } from "./shiny-button";

describe("ShinyButton", () => {
  it("renders its children", () => {
    render(<ShinyButton>Learn more</ShinyButton>);

    expect(screen.getByText("Learn more")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <ShinyButton className="custom-class">Action</ShinyButton>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
