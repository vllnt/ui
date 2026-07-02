import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Prose } from "./prose";

describe("Prose", () => {
  it("renders its children inside a container", () => {
    render(
      <Prose>
        <p>Paragraph</p>
      </Prose>,
    );

    expect(screen.getByText("Paragraph")).toBeInTheDocument();
  });

  it("applies the sans body token to the container", () => {
    const { container } = render(
      <Prose>
        <p>Body</p>
      </Prose>,
    );

    expect(container.firstChild).toHaveClass(
      "font-[family-name:var(--font-sans)]",
    );
  });

  it("merges a custom className", () => {
    const { container } = render(
      <Prose className="custom-class">
        <p>Body</p>
      </Prose>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("forwards a ref to the container", () => {
    let node: HTMLDivElement | null = null;
    render(
      <Prose
        ref={(element) => {
          node = element;
        }}
      >
        <p>Body</p>
      </Prose>,
    );

    expect(node).toBeInstanceOf(HTMLDivElement);
  });
});
