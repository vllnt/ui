import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button, buttonVariants } from "./button";

describe("Button", () => {
  it("renders a visible button that merges className and forwards ref", () => {
    const ref = { current: null };
    render(
      <Button className="custom-class" ref={ref}>
        Test
      </Button>,
    );
    expect(screen.getByRole("button")).toBeVisible();
    expect(screen.getByRole("button")).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it.each([
    ...(["default", "icon", "icon-lg", "lg", "sm"] as const).map((size) => ({
      size,
    })),
    ...(
      [
        "default",
        "destructive",
        "ghost",
        "link",
        "outline",
        "secondary",
      ] as const
    ).map((variant) => ({ variant })),
  ])("renders %o", (props) => {
    render(<Button {...props}>Test</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("sizes icon as 40 px and icon-lg as a 44 px square", () => {
    const { rerender } = render(<Button size="icon">I</Button>);
    expect(screen.getByRole("button")).toHaveClass("size-10");
    rerender(<Button size="icon-lg">I</Button>);
    expect(screen.getByRole("button")).toHaveClass("size-11");
    expect(buttonVariants({ size: "icon-lg" })).toContain("size-11");
  });
});
