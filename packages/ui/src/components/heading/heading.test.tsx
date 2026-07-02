import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Heading } from "./heading";

describe("Heading", () => {
  it("renders the semantic element for the given level", () => {
    render(<Heading level={3}>Section</Heading>);

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Section",
    );
  });

  it("defaults to an <h2>", () => {
    render(<Heading>Default</Heading>);

    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("drives the family and weight from tokens", () => {
    render(<Heading level={1}>Token-driven</Heading>);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("font-[family-name:var(--font-display)]");
    expect(heading).toHaveClass("[font-weight:var(--font-weight-heading)]");
  });

  it("merges a custom className", () => {
    render(
      <Heading className="custom-class" level={2}>
        Merged
      </Heading>,
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveClass(
      "custom-class",
    );
  });

  it("forwards a ref to the heading element", () => {
    let node: HTMLHeadingElement | null = null;
    render(
      <Heading
        level={1}
        ref={(element) => {
          node = element;
        }}
      >
        Ref
      </Heading>,
    );

    expect(node).toBeInstanceOf(HTMLHeadingElement);
  });
});
