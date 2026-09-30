import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Prose } from "./prose";

describe("Prose", () => {
  it("renders its children in a sans-token container that merges className and forwards ref", () => {
    let node: HTMLDivElement | null = null;
    const { container } = render(
      <Prose
        className="custom-class"
        ref={(element) => {
          node = element;
        }}
      >
        <p>Paragraph</p>
      </Prose>,
    );
    expect(screen.getByText("Paragraph")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(
      "font-[family-name:var(--font-sans)]",
      "custom-class",
    );
    expect(node).toBeInstanceOf(HTMLDivElement);
  });
});
