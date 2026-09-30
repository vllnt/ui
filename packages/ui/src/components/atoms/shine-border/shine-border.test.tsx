import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShineBorder } from "./shine-border";

describe("ShineBorder", () => {
  it("renders its children and applies a custom class name", () => {
    const { container } = render(
      <ShineBorder className="custom-class">Featured</ShineBorder>,
    );
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
