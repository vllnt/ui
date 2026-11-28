import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkipLink } from "./skip-link";

describe("SkipLink", () => {
  it("renders one link to #main with the given text", () => {
    render(<SkipLink>Skip to content</SkipLink>);
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveAttribute("href", "#main");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("jumps to another target when href is set", () => {
    render(<SkipLink href="#content">Skip</SkipLink>);
    expect(screen.getByRole("link", { name: "Skip" })).toHaveAttribute(
      "href",
      "#content",
    );
  });

  it("is hidden until it has focus and shows fixed at the content edge", () => {
    render(<SkipLink>Skip to content</SkipLink>);
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveClass("sr-only", "focus:not-sr-only", "focus:fixed");
  });

  it("sits in a page column", () => {
    render(<SkipLink>Skip to content</SkipLink>);
    const column = screen.getByRole("link").parentElement;
    expect(column).toHaveClass("mx-auto", "w-full");
    expect(column?.className).toContain("var(--spacing-page-gutter)");
  });

  it("uses tokens only: no shadow and no blur", () => {
    render(<SkipLink>Skip to content</SkipLink>);
    expect(screen.getByRole("link").className).not.toMatch(/shadow|blur/);
  });
});
