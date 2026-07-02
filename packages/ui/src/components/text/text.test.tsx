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

  it("applies the sans family token", () => {
    render(<Text>Token</Text>);

    expect(screen.getByText("Token")).toHaveClass(
      "font-[family-name:var(--font-sans)]",
    );
  });

  it("applies the muted tone", () => {
    render(<Text tone="muted">Muted</Text>);

    expect(screen.getByText("Muted")).toHaveClass("text-muted-foreground");
  });

  it("merges a custom className", () => {
    render(<Text className="custom-class">Merged</Text>);

    expect(screen.getByText("Merged")).toHaveClass("custom-class");
  });
});
