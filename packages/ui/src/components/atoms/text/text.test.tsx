import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Text } from "./text";

describe("Text", () => {
  it("renders a <p> by default", () => {
    const { container } = render(<Text>Body</Text>);
    expect(container.querySelector("p")).toHaveTextContent("Body");
  });

  it("renders the element given by `as`", () => {
    const { container } = render(<Text as="span">Inline</Text>);
    expect(container.querySelector("span")).toHaveTextContent("Inline");
  });

  it("forwards a ref to the rendered element", () => {
    let node: HTMLElement | null = null;
    render(
      <Text
        as="span"
        ref={(element) => {
          node = element;
        }}
      >
        Ref
      </Text>,
    );
    expect(node).toBeInstanceOf(HTMLSpanElement);
  });

  // Class-recipe assertions — typography-tokens.visual.tsx exercises the runtime
  // token resolution in a browser; these pin the class contract.
  it("applies the sans-family token class", () => {
    render(<Text>Token</Text>);
    expect(screen.getByText("Token")).toHaveClass(
      "font-[family-name:var(--font-sans)]",
    );
  });

  it("applies the mono-family token class with the body and lead sizes", () => {
    const { rerender } = render(<Text family="mono">Mono</Text>);
    const body = screen.getByText("Mono");
    expect(body).toHaveClass("font-[family-name:var(--font-mono)]");
    expect(body).not.toHaveClass("font-[family-name:var(--font-sans)]");
    expect(body).toHaveClass("text-[length:var(--font-size-body)]");
    rerender(
      <Text family="mono" size="lead">
        Mono
      </Text>,
    );
    expect(screen.getByText("Mono")).toHaveClass(
      "font-[family-name:var(--font-mono)]",
      "text-[length:var(--font-size-body-lg)]",
      "leading-[var(--line-height-body-lg)]",
    );
  });

  it("defaults to normal weight and applies the weight variant class", () => {
    const { rerender } = render(<Text>Default</Text>);
    expect(screen.getByText("Default")).toHaveClass("font-normal");
    rerender(<Text weight="semibold">Bold</Text>);
    expect(screen.getByText("Bold")).toHaveClass("font-semibold");
  });

  it("applies the muted tone class", () => {
    render(<Text tone="muted">Muted</Text>);
    expect(screen.getByText("Muted")).toHaveClass("text-muted-foreground");
  });

  it("merges a custom className", () => {
    render(<Text className="custom-class">Merged</Text>);
    expect(screen.getByText("Merged")).toHaveClass("custom-class");
  });
});
