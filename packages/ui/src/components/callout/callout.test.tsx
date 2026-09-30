import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Callout } from "./callout";

describe("Callout", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(
      <Callout className="custom-class">Test</Callout>,
    );
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
