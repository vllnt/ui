import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

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
    ...(["default", "icon", "lg", "sm"] as const).map((size) => ({ size })),
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
});
