import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

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

function height(value: number) {
  return { configurable: true, get: () => value };
}

function stubOverflow(scrolls: boolean) {
  Object.defineProperty(
    HTMLElement.prototype,
    "scrollHeight",
    height(scrolls ? 400 : 100),
  );
  Object.defineProperty(HTMLElement.prototype, "clientHeight", height(100));
}

describe("ScrollArea keyboard access", () => {
  afterEach(() => {
    stubOverflow(false);
  });

  it("makes the viewport a named tab stop when its content overflows", () => {
    stubOverflow(true);
    render(<ScrollArea aria-label="Release notes">content</ScrollArea>);
    const viewport = screen.getByRole("region", { name: "Release notes" });
    expect(viewport).toHaveAttribute("data-radix-scroll-area-viewport");
    expect(viewport).toHaveAttribute("tabindex", "0");
  });

  it("adds no tab stop when nothing scrolls", () => {
    stubOverflow(false);
    const { container } = render(<ScrollArea>content</ScrollArea>);
    expect(
      container.querySelector("[data-radix-scroll-area-viewport]"),
    ).not.toHaveAttribute("tabindex");
  });
});
