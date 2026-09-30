import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("renders a visible root that merges className and forwards ref", () => {
    const ref = { current: null };
    const { container } = render(<Avatar className="custom-class" ref={ref} />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
