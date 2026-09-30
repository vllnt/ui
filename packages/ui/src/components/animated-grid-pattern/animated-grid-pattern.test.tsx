import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedGridPattern } from "./animated-grid-pattern";

describe("AnimatedGridPattern", () => {
  it("renders the requested square count and merges className", () => {
    const { container } = render(
      <AnimatedGridPattern className="custom-class" squares={6} />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(container.querySelectorAll("rect.animate-pulse")).toHaveLength(6);
  });
});
