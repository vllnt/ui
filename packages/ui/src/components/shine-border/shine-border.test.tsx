import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShineBorder } from "./shine-border";

describe("ShineBorder", () => {
  it("renders its children", () => {
    render(<ShineBorder>Featured</ShineBorder>);

    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <ShineBorder className="custom-class">Card</ShineBorder>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
