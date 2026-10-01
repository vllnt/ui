import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("applies custom className", () => {
    const { container } = render(<Skeleton className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("is visible when rendered", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeVisible();
  });

  it("stops its infinite pulse under prefers-reduced-motion", () => {
    const { container } = render(<Skeleton />);
    const pulsing = [...container.querySelectorAll('[class*="animate-p"], [class*="animate-spin"]')];
    expect(pulsing.length).toBeGreaterThan(0);
    for (const element of pulsing) {
      expect(element.getAttribute("class")).toContain("motion-reduce:animate-none");
    }
  });
});
