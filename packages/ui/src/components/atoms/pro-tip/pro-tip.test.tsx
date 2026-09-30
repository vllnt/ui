import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProTip } from "./pro-tip";

describe("ProTip", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(
      <ProTip className="custom-class">Test Content</ProTip>,
    );
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
