import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScrollArea } from "./scroll-area";

describe("ScrollArea", () => {
  it("renders a visible root that merges className and forwards ref", () => {
    const ref = { current: null };
    const { container } = render(
      <ScrollArea className="custom-class" ref={ref} />,
    );
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe("ScrollArea keyboard access", () => {
  it("makes the scrolling viewport a keyboard tab stop", () => {
    const { container } = render(<ScrollArea>content</ScrollArea>);
    expect(
      container.querySelector("[data-radix-scroll-area-viewport]"),
    ).toHaveAttribute("tabindex", "0");
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
