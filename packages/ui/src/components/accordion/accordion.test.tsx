import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Accordion } from "./accordion";

describe("Accordion", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(
      <Accordion className="custom-class">Test</Accordion>,
    );
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
