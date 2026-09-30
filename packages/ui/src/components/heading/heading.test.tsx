import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Heading } from "./heading";

describe("Heading", () => {
  it("defaults to an <h2>", () => {
    render(<Heading>Default</Heading>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("renders the given level with token classes, className, and a forwarded ref", () => {
    let node: HTMLHeadingElement | null = null;
    render(
      <Heading
        className="custom-class"
        level={1}
        ref={(element) => {
          node = element;
        }}
      >
        Token-driven
      </Heading>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Token-driven");
    expect(heading).toHaveClass("font-[family-name:var(--font-display)]");
    expect(heading).toHaveClass("[font-weight:var(--font-weight-heading)]");
    expect(heading).toHaveClass("custom-class");
    expect(node).toBeInstanceOf(HTMLHeadingElement);
  });

  it("decouples visual size from semantic level via `size`", () => {
    render(
      <Heading level={3} size={1}>
        Big h3
      </Heading>,
    );
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Big h3");
    expect(heading).toHaveClass("text-[length:var(--font-size-h1)]");
  });
});
