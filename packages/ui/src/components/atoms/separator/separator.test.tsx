import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Separator } from "./separator";

describe("Separator", () => {
  it("applies custom className", () => {
    const { container } = render(<Separator className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("forwards ref to DOM element", () => {
    const ref = { current: null };
    render(<Separator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("is visible when rendered", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toBeVisible();
  });
});
