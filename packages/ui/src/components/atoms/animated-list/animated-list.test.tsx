import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedList } from "./animated-list";

describe("AnimatedList", () => {
  it("renders its children and merges className", () => {
    const { container } = render(
      <AnimatedList className="custom-class">
        <span>First</span>
        <span>Second</span>
      </AnimatedList>,
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
