import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("applies custom className", () => {
    const { container } = render(<Textarea className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("forwards ref to DOM element", () => {
    const ref = { current: null };
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("is visible when rendered", () => {
    const { container } = render(<Textarea />);
    expect(container.firstChild).toBeVisible();
  });
});
