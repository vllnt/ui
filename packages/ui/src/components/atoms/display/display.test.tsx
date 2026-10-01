import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Display } from "./display";

const REVEAL =
  "motion-safe:animate-[vllnt-animated-text-reveal_0.6s_ease-out_both]";

describe("Display", () => {
  // Class-recipe assertions — typography-tokens.visual.tsx exercises the runtime
  // token resolution in a browser; these pin the class contract.
  it("renders a static <div> with the display family + size token classes by default", () => {
    const { container } = render(<Display>Hero</Display>);
    const node = screen.getByText("Hero");
    expect(container.querySelector("div")).toHaveTextContent("Hero");
    expect(node).toHaveClass("font-[family-name:var(--font-display)]");
    expect(node).toHaveClass("text-[length:var(--font-size-display)]");
    expect(node).not.toHaveClass(REVEAL);
  });

  it("renders as a heading when asked and forwards a ref", () => {
    let node: HTMLElement | null = null;
    render(
      <Display
        as="h1"
        ref={(element) => {
          node = element;
        }}
      >
        Hero
      </Display>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hero");
    expect(node).toBeInstanceOf(HTMLHeadingElement);
  });

  it("gates the reveal animation behind motion-safe", () => {
    render(<Display animated>Animated</Display>);
    expect(screen.getByText("Animated")).toHaveClass(REVEAL);
  });
});
