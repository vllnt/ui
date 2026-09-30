import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShinyButton } from "./shiny-button";

describe("ShinyButton", () => {
  it("renders its children and applies a custom class name", () => {
    const { container } = render(
      <ShinyButton className="custom-class">Learn more</ShinyButton>,
    );
    expect(screen.getByText("Learn more")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
