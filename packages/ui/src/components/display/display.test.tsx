import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Display } from "./display";

describe("Display", () => {
  it("renders a <div> by default", () => {
    const { container } = render(<Display>Hero</Display>);

    expect(container.querySelector("div")).toHaveTextContent("Hero");
  });

  it("renders as a heading when asked", () => {
    render(<Display as="h1">Hero</Display>);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hero");
  });

  it("uses the display family and size tokens", () => {
    render(<Display>Token</Display>);

    const node = screen.getByText("Token");
    expect(node).toHaveClass("font-[family-name:var(--font-display)]");
    expect(node).toHaveClass("text-[length:var(--font-size-display)]");
  });

  it("gates the reveal animation behind motion-safe", () => {
    render(<Display animated>Animated</Display>);

    expect(screen.getByText("Animated")).toHaveClass(
      "motion-safe:animate-[vllnt-animated-text-reveal_0.6s_ease-out_both]",
    );
  });

  it("has no animation class by default", () => {
    render(<Display>Static</Display>);

    expect(screen.getByText("Static")).not.toHaveClass(
      "motion-safe:animate-[vllnt-animated-text-reveal_0.6s_ease-out_both]",
    );
  });
});
