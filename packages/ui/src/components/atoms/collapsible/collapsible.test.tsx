import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Collapsible } from "./collapsible";

describe("Collapsible", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(<Collapsible className="custom-class" />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
